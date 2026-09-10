import { createAsyncStorageAdapter } from './adapters/asyncStorageAdapter'

export * from './models'

export const storageService = createAsyncStorageAdapter()
