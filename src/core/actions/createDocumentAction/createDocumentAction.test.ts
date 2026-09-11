import { createDocument, DocumentError } from '@core/domains/document'
import { FileReaderError, fileReaderService } from '@services/fileReader'
import en from '@translations/en.json'

import { createDocumentAction } from './action'
import { createDocumentActionToModel } from './mappers/createDocumentActionToModel'
import { createDocumentActionBase64Mock, createDocumentActionMock } from './mocks/createDocumentActionMock'
import { ActionStatusTypes } from './models'

jest.mock('@services/http', () => ({
  httpService: { get: jest.fn() },
}))

jest.mock('@core/domains/document', () => ({
  ...jest.requireActual('@core/domains/document'),
  createDocument: jest.fn(),
}))

jest.mock('@services/fileReader', () => ({
  ...jest.requireActual('@services/fileReader/models'),
  fileReaderService: { readAsBase64: jest.fn() },
}))

jest.mock('@services/translate', () => {
  const catalog: Record<string, string> = jest.requireActual('@translations/en.json')

  return {
    translateService: { translate: (key: string): string => catalog[key] },
  }
})

const createDocumentMock = createDocument as jest.Mock

const readAsBase64Mock = fileReaderService.readAsBase64 as jest.Mock

beforeEach(() => {
  createDocumentMock.mockReset()
  createDocumentMock.mockResolvedValue(undefined)
  readAsBase64Mock.mockReset()
  readAsBase64Mock.mockResolvedValue(createDocumentActionBase64Mock)
})

describe('createDocumentActionToModel', () => {
  it('folds the base64 contents into the domain model', () => {
    expect(
      createDocumentActionToModel({
        action: createDocumentActionMock,
        fileBase64: createDocumentActionBase64Mock,
      }),
    ).toEqual({
      name: 'Service contract',
      version: '1.0.0',
      fileBase64: createDocumentActionBase64Mock,
      fileName: 'service-contract.pdf',
    })
  })

  it('drops the file uri, which the domain has no use for', () => {
    const document = createDocumentActionToModel({
      action: createDocumentActionMock,
      fileBase64: createDocumentActionBase64Mock,
    })

    expect(document).not.toHaveProperty('fileUri')
  })
})

describe('createDocumentAction', () => {
  it('reads the picked file from its uri', async () => {
    await createDocumentAction(createDocumentActionMock)

    expect(readAsBase64Mock).toHaveBeenCalledWith('file:///cache/service-contract.pdf')
  })

  it('hands the domain the values plus the encoded file', async () => {
    await createDocumentAction(createDocumentActionMock)

    expect(createDocumentMock).toHaveBeenCalledWith({
      name: 'Service contract',
      version: '1.0.0',
      fileBase64: createDocumentActionBase64Mock,
      fileName: 'service-contract.pdf',
    })
  })

  it('reports success when the document was created', async () => {
    await expect(createDocumentAction(createDocumentActionMock)).resolves.toEqual({
      status: ActionStatusTypes.Ok,
    })
  })

  it('does not reject when the file cannot be read', async () => {
    readAsBase64Mock.mockRejectedValue(new FileReaderError('unreadable'))

    await expect(createDocumentAction(createDocumentActionMock)).resolves.toMatchObject({
      status: ActionStatusTypes.Error,
    })
  })

  it('does not call the domain when the file cannot be read', async () => {
    readAsBase64Mock.mockRejectedValue(new FileReaderError('unreadable'))

    await createDocumentAction(createDocumentActionMock)

    expect(createDocumentMock).not.toHaveBeenCalled()
  })

  it('turns a domain failure into a controlled message keeping the raw cause', async () => {
    const domainError = new DocumentError('The document could not be created.')
    createDocumentMock.mockRejectedValue(domainError)

    await expect(createDocumentAction(createDocumentActionMock)).resolves.toEqual({
      status: ActionStatusTypes.Error,
      message: en._CREATE_DOCUMENT_ACTION_ERROR,
      cause: domainError,
    })
  })
})
