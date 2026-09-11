import { File } from 'expo-file-system'

import { FileReaderError, type FileReaderServiceModel } from '../models'

export const createExpoFileReaderAdapter = (): FileReaderServiceModel => ({
  readAsBase64: async (uri: string): Promise<string> => {
    try {
      return await new File(uri).base64()
    } catch (error) {
      throw new FileReaderError(`The file at ${uri} could not be read.`, { cause: error })
    }
  },
})
