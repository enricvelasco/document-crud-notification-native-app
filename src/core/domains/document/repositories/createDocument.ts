// import { httpService } from '@services/http'

import { createDocumentModelToPayload } from '../mappers/createDocumentModelToPayload'
import { type CreateDocumentPayloadModel, type CreateDocumentType, DocumentError } from '../models'

// const CREATE_DOCUMENT_PATH = '/documents'

const CREATE_DOCUMENT_SIMULATED_DELAY_MS = 2000

const sendCreateDocumentPayload = (
  payload: CreateDocumentPayloadModel,
): Promise<CreateDocumentPayloadModel> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(payload), CREATE_DOCUMENT_SIMULATED_DELAY_MS)
  })

export const createDocument: CreateDocumentType = async (document) => {
  const payload = createDocumentModelToPayload(document)

  try {
    await sendCreateDocumentPayload(payload)
    // await httpService.post(CREATE_DOCUMENT_PATH, payload)
    console.log('Document created:', payload);
  } catch (error) {
    throw new DocumentError('The document could not be created.', { cause: error })
  }
}
