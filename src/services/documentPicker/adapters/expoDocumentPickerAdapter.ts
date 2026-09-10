import { type DocumentPickerAsset, type DocumentPickerResult, getDocumentAsync } from 'expo-document-picker'

import { DocumentPickerError, type DocumentPickerServiceModel, type PickedDocumentModel } from '../models'

const SINGLE_DOCUMENT_OPTIONS = {
  multiple: false,
  copyToCacheDirectory: true,
}

const toPickedAsset = (result: DocumentPickerResult): DocumentPickerAsset | null => {
  if (result.canceled) {
    return null
  }

  return result.assets[0] ?? null
}

const toPickedDocument = ({ name, uri, mimeType, size }: DocumentPickerAsset): PickedDocumentModel => ({
  name,
  uri,
  mimeType,
  size,
})

export const createExpoDocumentPickerAdapter = (): DocumentPickerServiceModel => ({
  pickDocument: async (): Promise<PickedDocumentModel | null> => {
    try {
      const pickedAsset = toPickedAsset(await getDocumentAsync(SINGLE_DOCUMENT_OPTIONS))

      return pickedAsset ? toPickedDocument(pickedAsset) : null
    } catch (error) {
      throw new DocumentPickerError('The document could not be picked.', { cause: error })
    }
  },
})
