import type { CreateDocumentModel, CreateDocumentPayloadModel } from '../models'

export const createDocumentModelToPayload = (
  document: CreateDocumentModel,
): CreateDocumentPayloadModel => ({
  name: document.name,
  version: document.version,
  file_base_64: document.fileBase64,
  file_name: document.fileName,
})
