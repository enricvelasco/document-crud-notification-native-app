import { createAsyncStorageAdapter } from './adapters/asyncStorageAdapter'
import { StorageError } from './models'

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}))

const { default: asyncStorage } = jest.requireMock('@react-native-async-storage/async-storage') as {
  default: {
    getItem: jest.Mock
    setItem: jest.Mock
    removeItem: jest.Mock
    clear: jest.Mock
  }
}

const STORED_DOCUMENT = { id: '1', name: 'contract.pdf' }

const givenStoredValue = (storedValue: string | null): void => {
  asyncStorage.getItem.mockResolvedValue(storedValue)
}

beforeEach(() => {
  asyncStorage.getItem.mockReset()
  asyncStorage.setItem.mockReset().mockResolvedValue(undefined)
  asyncStorage.removeItem.mockReset().mockResolvedValue(undefined)
  asyncStorage.clear.mockReset().mockResolvedValue(undefined)
  givenStoredValue(JSON.stringify(STORED_DOCUMENT))
})

describe('createAsyncStorageAdapter', () => {
  it('returns the stored value already parsed', async () => {
    await expect(createAsyncStorageAdapter().getItem('document')).resolves.toEqual(STORED_DOCUMENT)
  })

  it('asks the platform for the requested key', async () => {
    await createAsyncStorageAdapter().getItem('document')

    expect(asyncStorage.getItem).toHaveBeenCalledWith('document')
  })

  it('returns nothing when the key was never stored', async () => {
    givenStoredValue(null)

    await expect(createAsyncStorageAdapter().getItem('document')).resolves.toBeNull()
  })

  it('wraps an unreadable stored value in a storage error', async () => {
    givenStoredValue('not json')

    await expect(createAsyncStorageAdapter().getItem('document')).rejects.toThrow(StorageError)
  })

  it('wraps a read failure in a storage error', async () => {
    asyncStorage.getItem.mockRejectedValue(new Error('storage unavailable'))

    await expect(createAsyncStorageAdapter().getItem('document')).rejects.toThrow(StorageError)
  })

  it('keeps the original read failure as the cause', async () => {
    const unavailableError = new Error('storage unavailable')
    asyncStorage.getItem.mockRejectedValue(unavailableError)

    await expect(createAsyncStorageAdapter().getItem('document')).rejects.toMatchObject({
      cause: unavailableError,
    })
  })

  it('serialises the value it stores', async () => {
    await createAsyncStorageAdapter().setItem('document', STORED_DOCUMENT)

    expect(asyncStorage.setItem).toHaveBeenCalledWith('document', JSON.stringify(STORED_DOCUMENT))
  })

  it('wraps a write failure in a storage error', async () => {
    asyncStorage.setItem.mockRejectedValue(new Error('quota exceeded'))

    await expect(createAsyncStorageAdapter().setItem('document', STORED_DOCUMENT)).rejects.toThrow(StorageError)
  })

  it('removes the requested key', async () => {
    await createAsyncStorageAdapter().removeItem('document')

    expect(asyncStorage.removeItem).toHaveBeenCalledWith('document')
  })

  it('wraps a removal failure in a storage error', async () => {
    asyncStorage.removeItem.mockRejectedValue(new Error('storage unavailable'))

    await expect(createAsyncStorageAdapter().removeItem('document')).rejects.toThrow(StorageError)
  })

  it('clears every stored value', async () => {
    await createAsyncStorageAdapter().clear()

    expect(asyncStorage.clear).toHaveBeenCalledTimes(1)
  })

  it('wraps a clearing failure in a storage error', async () => {
    asyncStorage.clear.mockRejectedValue(new Error('storage unavailable'))

    await expect(createAsyncStorageAdapter().clear()).rejects.toThrow(StorageError)
  })
})
