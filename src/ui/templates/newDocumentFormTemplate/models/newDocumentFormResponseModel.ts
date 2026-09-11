import type { NewDocumentFormResponseTypes } from './newDocumentFormResponseTypes'

export interface NewDocumentFormSuccessResponseModel {
  readonly type: typeof NewDocumentFormResponseTypes.Success
}

export interface NewDocumentFormErrorResponseModel {
  readonly type: typeof NewDocumentFormResponseTypes.Error
  readonly message: string
}

export type NewDocumentFormResponseModel =
  | NewDocumentFormSuccessResponseModel
  | NewDocumentFormErrorResponseModel
