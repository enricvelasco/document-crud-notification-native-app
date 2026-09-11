import { createDocument } from '@core/domains/document'
import { fileReaderService } from '@services/fileReader'
import { translateService } from '@services/translate'

import { createDocumentActionToModel } from './mappers/createDocumentActionToModel'
import { type ActionResultType, ActionStatusTypes, type CreateDocumentActionModel } from './models'

export const createDocumentAction = async (
  action: CreateDocumentActionModel,
): Promise<ActionResultType> => {
  try {
    const fileBase64 = await fileReaderService.readAsBase64(action.fileUri)

    await createDocument(createDocumentActionToModel({ action, fileBase64 }))

    return { status: ActionStatusTypes.Ok }
  } catch (error) {
    return {
      status: ActionStatusTypes.Error,
      message: translateService.translate('_CREATE_DOCUMENT_ACTION_ERROR'),
      cause: error,
    }
  }
}
