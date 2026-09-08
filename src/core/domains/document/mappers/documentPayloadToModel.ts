import type { DocumentModel, DocumentPayloadModel } from '../models'
import { documentContributorPayloadToModel } from './documentContributorPayloadToModel'

export const documentPayloadToModel = (payload: DocumentPayloadModel): DocumentModel => ({
  id: payload.ID,
  createdAt: payload.CreatedAt,
  updatedAt: payload.UpdatedAt,
  title: payload.Title,
  attachments: payload.Attachments,
  contributors: payload.Contributors.map(documentContributorPayloadToModel),
  version: payload.Version,
})
