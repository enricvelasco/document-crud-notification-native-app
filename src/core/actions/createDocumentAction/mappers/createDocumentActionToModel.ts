import type { CreateDocumentModel } from '@core/domains/document'

import type { CreateDocumentActionMapperModel } from '../models'

export const createDocumentActionToModel = ({
  action,
  fileBase64,
}: CreateDocumentActionMapperModel): CreateDocumentModel => ({
  name: action.name,
  version: action.version,
  fileBase64,
  fileName: action.fileName,
})
