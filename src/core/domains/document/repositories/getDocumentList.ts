import { httpService } from '@services/http'

import { documentListPayloadToModel } from '../mappers/documentListPayloadToModel'
import { DocumentError, type DocumentListPayloadType, type GetDocumentListType } from '../models'

const DOCUMENT_LIST_PATH = '/documents'

export const getDocumentList: GetDocumentListType = async (signal) => {
  try {
    const payload = await httpService.get<DocumentListPayloadType>(DOCUMENT_LIST_PATH, { signal })

    return { documents: documentListPayloadToModel(payload) }
  } catch (error) {
    throw new DocumentError('The document list could not be loaded.', { cause: error })
  }
}
