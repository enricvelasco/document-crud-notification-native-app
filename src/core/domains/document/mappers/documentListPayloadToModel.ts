import type { DocumentListPayloadType, DocumentListType } from '../models'
import { documentPayloadToModel } from './documentPayloadToModel'

export const documentListPayloadToModel = (payload: DocumentListPayloadType): DocumentListType =>
  payload.map(documentPayloadToModel)
