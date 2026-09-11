import { createExpoFileReaderAdapter } from './adapters/expoFileReaderAdapter'

export * from './models'

export const fileReaderService = createExpoFileReaderAdapter()
