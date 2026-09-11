import type { NewDocumentFormResponseModel } from './newDocumentFormResponseModel'
import type { NewDocumentFormValuesModel } from './newDocumentFormValuesModel'

export type NewDocumentFormSubmitType =
  (values: NewDocumentFormValuesModel) => Promise<NewDocumentFormResponseModel>
