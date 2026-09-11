import { type NewDocumentFormResponseModel, NewDocumentFormResponseTypes } from '@ui/templates/newDocumentFormTemplate'

export const isNewDocumentCreated = (response: NewDocumentFormResponseModel): boolean =>
  response.type === NewDocumentFormResponseTypes.Success
