import { httpService } from '@services/http'

import { createDocumentModelToPayload } from './mappers/createDocumentModelToPayload'
import { documentContributorPayloadToModel } from './mappers/documentContributorPayloadToModel'
import { documentListPayloadToModel } from './mappers/documentListPayloadToModel'
import { documentPayloadToModel } from './mappers/documentPayloadToModel'
import {
  createDocumentMock,
  createDocumentPayloadMock,
  documentListMock,
  documentListPayloadMock,
  getDocumentListResponseMock,
} from './mocks/documentMock'
import { DocumentError } from './models'
import { createDocument } from './repositories/createDocument'
import { getDocumentList } from './repositories/getDocumentList'

jest.mock('@services/http', () => ({
  httpService: { get: jest.fn() },
}))

const httpServiceGetMock = httpService.get as jest.Mock

const CREATE_DOCUMENT_SIMULATED_DELAY_MS = 2000

beforeEach(() => {
  httpServiceGetMock.mockReset()
})

describe('documentContributorPayloadToModel', () => {
  it('translates a contributor payload to camelCase', () => {
    const payload = documentListPayloadMock[0].Contributors[0]

    expect(documentContributorPayloadToModel(payload)).toEqual({
      id: '1f2ff2e2-855a-4e2f-9ac5-a43788831d74',
      name: 'Cyril Huels',
    })
  })
})

describe('documentPayloadToModel', () => {
  it('translates a document payload to camelCase without reshaping it', () => {
    expect(documentPayloadToModel(documentListPayloadMock[0])).toEqual(documentListMock[0])
  })

  it('keeps dates as raw strings', () => {
    const document = documentPayloadToModel(documentListPayloadMock[0])

    expect(document.createdAt).toBe('1971-01-22T17:18:03.490907425Z')
    expect(document.updatedAt).toBe('1948-05-15T20:53:11.428431887Z')
  })

  it('preserves the attachment and contributor cardinality', () => {
    const document = documentPayloadToModel(documentListPayloadMock[2])

    expect(document.attachments).toHaveLength(documentListPayloadMock[2].Attachments.length)
    expect(document.contributors).toHaveLength(documentListPayloadMock[2].Contributors.length)
  })
})

describe('documentListPayloadToModel', () => {
  it('translates every document of the payload preserving the order', () => {
    expect(documentListPayloadToModel(documentListPayloadMock)).toEqual(documentListMock)
  })

  it('returns an empty list for an empty payload', () => {
    expect(documentListPayloadToModel([])).toEqual([])
  })
})

describe('getDocumentList', () => {
  it('requests the document list endpoint', async () => {
    httpServiceGetMock.mockResolvedValue(documentListPayloadMock)

    await getDocumentList()

    expect(httpServiceGetMock).toHaveBeenCalledWith('/documents', { signal: undefined })
  })

  it('forwards the abort signal to the transport', async () => {
    const abortController = new AbortController()
    httpServiceGetMock.mockResolvedValue(documentListPayloadMock)

    await getDocumentList(abortController.signal)

    expect(httpServiceGetMock).toHaveBeenCalledWith('/documents', {
      signal: abortController.signal,
    })
  })

  it('returns the mapped document list inside the response model', async () => {
    httpServiceGetMock.mockResolvedValue(documentListPayloadMock)

    await expect(getDocumentList()).resolves.toEqual(getDocumentListResponseMock)
  })

  it('fails with a DocumentError when the transport rejects', async () => {
    httpServiceGetMock.mockRejectedValue(new Error('Network is unreachable.'))

    await expect(getDocumentList()).rejects.toBeInstanceOf(DocumentError)
  })

  it('keeps the transport error as the cause', async () => {
    const transportError = new Error('Network is unreachable.')
    httpServiceGetMock.mockRejectedValue(transportError)

    await expect(getDocumentList()).rejects.toMatchObject({ cause: transportError })
  })
})

describe('createDocumentModelToPayload', () => {
  it('translates a create document model to the payload the endpoint expects', () => {
    expect(createDocumentModelToPayload(createDocumentMock)).toEqual(createDocumentPayloadMock)
  })

  it('carries the base64 contents under the payload file key', () => {
    const payload = createDocumentModelToPayload({ ...createDocumentMock, fileBase64: 'QUJD' })

    expect(payload.file_base_64).toBe('QUJD')
  })
})

describe('createDocument', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('resolves once the simulated request has answered', async () => {
    const request = createDocument(createDocumentMock)

    await jest.advanceTimersByTimeAsync(CREATE_DOCUMENT_SIMULATED_DELAY_MS)

    await expect(request).resolves.toBeUndefined()
  })

  it('does not answer before the simulated delay has elapsed', async () => {
    const settled = jest.fn()
    void createDocument(createDocumentMock).then(settled)

    await jest.advanceTimersByTimeAsync(CREATE_DOCUMENT_SIMULATED_DELAY_MS - 1)

    expect(settled).not.toHaveBeenCalled()
  })

  it('does not reach the transport while the endpoint does not exist', async () => {
    const request = createDocument(createDocumentMock)

    await jest.advanceTimersByTimeAsync(CREATE_DOCUMENT_SIMULATED_DELAY_MS)
    await request

    expect(httpServiceGetMock).not.toHaveBeenCalled()
  })

  it('fails with a DocumentError when the request rejects', async () => {
    jest.spyOn(globalThis, 'setTimeout').mockImplementation(() => {
      throw new Error('Network is unreachable.')
    })

    await expect(createDocument(createDocumentMock)).rejects.toBeInstanceOf(DocumentError)
  })
})
