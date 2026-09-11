import { type NewDocumentFormErrorResponseModel, type NewDocumentFormResponseModel, NewDocumentFormResponseTypes } from '../models'

export const isNewDocumentFormErrorResponse = (
  response: NewDocumentFormResponseModel,
): response is NewDocumentFormErrorResponseModel =>
  response.type === NewDocumentFormResponseTypes.Error
