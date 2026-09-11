import { createExpoFileReaderAdapter } from './adapters/expoFileReaderAdapter'
import { FileReaderError } from './models'

const mockBase64 = jest.fn()

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({ base64: mockBase64 })),
}))

const { File } = jest.requireMock('expo-file-system') as { File: jest.Mock }

const CONTRACT_URI = 'file:///cache/contract.pdf'

const CONTRACT_BASE64 = 'JVBERi0xLjQK'

beforeEach(() => {
  File.mockClear()
  mockBase64.mockReset()
  mockBase64.mockResolvedValue(CONTRACT_BASE64)
})

describe('createExpoFileReaderAdapter', () => {
  it('returns the file contents encoded as base64', async () => {
    await expect(createExpoFileReaderAdapter().readAsBase64(CONTRACT_URI)).resolves.toBe(
      CONTRACT_BASE64,
    )
  })

  it('reads the file the caller asked for', async () => {
    await createExpoFileReaderAdapter().readAsBase64(CONTRACT_URI)

    expect(File).toHaveBeenCalledWith(CONTRACT_URI)
  })

  it('wraps a read failure in a file reader error', async () => {
    mockBase64.mockRejectedValue(new Error('no such file'))

    await expect(createExpoFileReaderAdapter().readAsBase64(CONTRACT_URI)).rejects.toBeInstanceOf(
      FileReaderError,
    )
  })

  it('names the unreadable file in the error message', async () => {
    mockBase64.mockRejectedValue(new Error('no such file'))

    await expect(createExpoFileReaderAdapter().readAsBase64(CONTRACT_URI)).rejects.toThrow(
      CONTRACT_URI,
    )
  })

  it('keeps the original failure as the cause', async () => {
    const readError = new Error('no such file')
    mockBase64.mockRejectedValue(readError)

    await expect(createExpoFileReaderAdapter().readAsBase64(CONTRACT_URI)).rejects.toMatchObject({
      cause: readError,
    })
  })
})
