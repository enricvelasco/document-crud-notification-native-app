import { createDocumentAction } from '@core/actions/createDocumentAction'
import { ActionStatusTypes } from '@core/actions/createDocumentAction/models'
import { NewDocumentFormResponseTypes } from '@ui/templates/newDocumentFormTemplate'

import { createNewDocumentSubmit, submitNewDocument } from './resources/services'
import { isNewDocumentCreated } from './resources/utils'

jest.mock('@core/actions/createDocumentAction', () => ({
  ...jest.requireActual('@core/actions/createDocumentAction/models'),
  createDocumentAction: jest.fn(),
}))

const createDocumentActionMock = createDocumentAction as jest.Mock

const formValuesMock = {
  name: 'Service contract',
  version: '1.0.0',
  fileName: 'service-contract.pdf',
  fileUri: 'file:///cache/service-contract.pdf',
} as const

beforeEach(() => {
  createDocumentActionMock.mockReset()
  createDocumentActionMock.mockResolvedValue({ status: ActionStatusTypes.Ok })
})

describe('submitNewDocument', () => {
  it('hands the form values to the action', async () => {
    await submitNewDocument(formValuesMock)

    expect(createDocumentActionMock).toHaveBeenCalledWith({
      name: 'Service contract',
      version: '1.0.0',
      fileName: 'service-contract.pdf',
      fileUri: 'file:///cache/service-contract.pdf',
    })
  })

  it('reports success when the action created the document', async () => {
    await expect(submitNewDocument(formValuesMock)).resolves.toEqual({
      type: NewDocumentFormResponseTypes.Success,
    })
  })

  it('paints the action message when the document could not be created', async () => {
    createDocumentActionMock.mockResolvedValue({
      status: ActionStatusTypes.Error,
      message: 'The document could not be created. Try again.',
      cause: new Error('boom'),
    })

    await expect(submitNewDocument(formValuesMock)).resolves.toEqual({
      type: NewDocumentFormResponseTypes.Error,
      message: 'The document could not be created. Try again.',
    })
  })

  it('does not leak the raw cause into the form response', async () => {
    createDocumentActionMock.mockResolvedValue({
      status: ActionStatusTypes.Error,
      message: 'The document could not be created. Try again.',
      cause: new Error('boom'),
    })

    await expect(submitNewDocument(formValuesMock)).resolves.not.toHaveProperty('cause')
  })
})

describe('isNewDocumentCreated', () => {
  it('recognises a success response', () => {
    expect(isNewDocumentCreated({ type: NewDocumentFormResponseTypes.Success })).toBe(true)
  })

  it('does not recognise an error response', () => {
    expect(
      isNewDocumentCreated({ type: NewDocumentFormResponseTypes.Error, message: 'boom' }),
    ).toBe(false)
  })
})

describe('createNewDocumentSubmit', () => {
  it('closes the screen once the document is created', async () => {
    const onCreated = jest.fn()

    await createNewDocumentSubmit(onCreated)(formValuesMock)

    expect(onCreated).toHaveBeenCalledTimes(1)
  })

  it('keeps the screen open when the document could not be created', async () => {
    const onCreated = jest.fn()
    createDocumentActionMock.mockResolvedValue({
      status: ActionStatusTypes.Error,
      message: 'The document could not be created. Try again.',
      cause: new Error('boom'),
    })

    await createNewDocumentSubmit(onCreated)(formValuesMock)

    expect(onCreated).not.toHaveBeenCalled()
  })

  it('still answers the form with the error so it can be painted', async () => {
    createDocumentActionMock.mockResolvedValue({
      status: ActionStatusTypes.Error,
      message: 'The document could not be created. Try again.',
      cause: new Error('boom'),
    })

    await expect(createNewDocumentSubmit(jest.fn())(formValuesMock)).resolves.toEqual({
      type: NewDocumentFormResponseTypes.Error,
      message: 'The document could not be created. Try again.',
    })
  })

  it('answers the form with the success it reported to the screen', async () => {
    await expect(createNewDocumentSubmit(jest.fn())(formValuesMock)).resolves.toEqual({
      type: NewDocumentFormResponseTypes.Success,
    })
  })
})
