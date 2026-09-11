import { type ActionResultType, ActionStatusTypes, createDocumentAction } from '@core/actions/createDocumentAction'
import { type NewDocumentFormResponseModel, NewDocumentFormResponseTypes, type NewDocumentFormSubmitType } from '@ui/templates/newDocumentFormTemplate'

import { isNewDocumentCreated } from './utils'

const actionResultToFormResponse = (result: ActionResultType): NewDocumentFormResponseModel =>
  result.status === ActionStatusTypes.Error
    ? { type: NewDocumentFormResponseTypes.Error, message: result.message }
    : { type: NewDocumentFormResponseTypes.Success }

export const submitNewDocument: NewDocumentFormSubmitType = async (values) =>
  actionResultToFormResponse(
    await createDocumentAction({
      name: values.name,
      version: values.version,
      fileName: values.fileName,
      fileUri: values.fileUri,
    }),
  )

export const createNewDocumentSubmit = (
  onCreated: () => void,
): NewDocumentFormSubmitType => async (values) => {
  const response = await submitNewDocument(values)

  if (isNewDocumentCreated(response)) onCreated()

  return response
}
