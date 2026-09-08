import { createFetchHttpAdapter } from './adapters/fetchHttpAdapter'
import { HttpError, HttpErrorTypes } from './models'

const BASE_URL = 'https://api.example.com'
const TIMEOUT_MS = 5000

const fetchMock = jest.fn()

globalThis.fetch = fetchMock as unknown as typeof fetch

const toAbortError = (): Error => {
  const error = new Error('Aborted')
  error.name = 'AbortError'

  return error
}

const toResponseStub = (body: unknown): Response =>
  ({ ok: true, status: 200, json: () => Promise.resolve(body) }) as Response

const httpService = createFetchHttpAdapter({ baseUrl: BASE_URL, timeoutMs: TIMEOUT_MS })

beforeEach(() => {
  fetchMock.mockReset()
})

describe('createFetchHttpAdapter', () => {
  it('builds the request url from the base url and the path', async () => {
    fetchMock.mockResolvedValue(toResponseStub([]))

    await httpService.get('/documents')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/documents',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('does not double the slash when the base url ends with one', async () => {
    fetchMock.mockResolvedValue(toResponseStub([]))
    const service = createFetchHttpAdapter({ baseUrl: `${BASE_URL}/`, timeoutMs: TIMEOUT_MS })

    await service.get('/documents')

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/documents')
  })

  it('returns the parsed json body', async () => {
    fetchMock.mockResolvedValue(toResponseStub([{ ID: 'a' }]))

    await expect(httpService.get('/documents')).resolves.toEqual([{ ID: 'a' }])
  })

  it('fails with a status error when the response is not ok', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response)

    await expect(httpService.get('/documents')).rejects.toMatchObject({
      type: HttpErrorTypes.Status,
      status: 503,
    })
  })

  it('fails with a network error when the request cannot be sent', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    await expect(httpService.get('/documents')).rejects.toMatchObject({
      type: HttpErrorTypes.Network,
      status: null,
    })
  })

  it('fails with a timeout error when the request is aborted', async () => {
    fetchMock.mockRejectedValue(toAbortError())

    await expect(httpService.get('/documents')).rejects.toMatchObject({
      type: HttpErrorTypes.Timeout,
    })
  })

  it('fails with a timeout error when the body is aborted mid-read', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(toAbortError()),
    } as unknown as Response)

    await expect(httpService.get('/documents')).rejects.toMatchObject({
      type: HttpErrorTypes.Timeout,
    })
  })

  it('fails with a parse error when the body is not valid json', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    } as unknown as Response)

    await expect(httpService.get('/documents')).rejects.toMatchObject({
      type: HttpErrorTypes.Parse,
      status: 200,
    })
  })

  it('always throws our own error type, never the transport one', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    await expect(httpService.get('/documents')).rejects.toBeInstanceOf(HttpError)
  })
})
