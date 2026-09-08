import type { DocumentContributorModel, DocumentContributorPayloadModel } from '../models'

export const documentContributorPayloadToModel = (
  payload: DocumentContributorPayloadModel,
): DocumentContributorModel => ({
  id: payload.ID,
  name: payload.Name,
})
