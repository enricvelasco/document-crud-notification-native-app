import { createExpoDocumentPickerAdapter } from './adapters/expoDocumentPickerAdapter'
import { DocumentPickerError } from './models'

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }))

const { getDocumentAsync } = jest.requireMock('expo-document-picker') as { getDocumentAsync: jest.Mock }

const CONTRACT_ASSET = {
  name: 'contract.pdf',
  uri: 'file:///cache/contract.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  lastModified: 1700000000000,
}

const givenPickedAssets = (assets: readonly (typeof CONTRACT_ASSET)[]): void => {
  getDocumentAsync.mockResolvedValue({ canceled: false, assets })
}

const givenCanceledPicker = (): void => {
  getDocumentAsync.mockResolvedValue({ canceled: true, assets: null })
}

beforeEach(() => {
  getDocumentAsync.mockReset()
  givenPickedAssets([CONTRACT_ASSET])
})

describe('createExpoDocumentPickerAdapter', () => {
  it('returns the picked document', async () => {
    await expect(createExpoDocumentPickerAdapter().pickDocument()).resolves.toEqual({
      name: 'contract.pdf',
      uri: 'file:///cache/contract.pdf',
      mimeType: 'application/pdf',
      size: 1024,
    })
  })

  it('drops the fields the app does not own', async () => {
    const pickedDocument = await createExpoDocumentPickerAdapter().pickDocument()

    expect(pickedDocument).not.toHaveProperty('lastModified')
  })

  it('keeps the first document when the platform returns several', async () => {
    givenPickedAssets([CONTRACT_ASSET, { ...CONTRACT_ASSET, name: 'invoice.pdf' }])

    const pickedDocument = await createExpoDocumentPickerAdapter().pickDocument()

    expect(pickedDocument?.name).toBe('contract.pdf')
  })

  it('returns nothing when the user cancels', async () => {
    givenCanceledPicker()

    await expect(createExpoDocumentPickerAdapter().pickDocument()).resolves.toBeNull()
  })

  it('returns nothing when the picker reports success without a document', async () => {
    givenPickedAssets([])

    await expect(createExpoDocumentPickerAdapter().pickDocument()).resolves.toBeNull()
  })

  it('asks the platform for a single cached document', async () => {
    await createExpoDocumentPickerAdapter().pickDocument()

    expect(getDocumentAsync).toHaveBeenCalledWith({ multiple: false, copyToCacheDirectory: true })
  })

  it('wraps a picker failure in a document picker error', async () => {
    getDocumentAsync.mockRejectedValue(new Error('no read permission'))

    await expect(createExpoDocumentPickerAdapter().pickDocument()).rejects.toThrow(DocumentPickerError)
  })

  it('keeps the original failure as the cause', async () => {
    const permissionError = new Error('no read permission')
    getDocumentAsync.mockRejectedValue(permissionError)

    await expect(createExpoDocumentPickerAdapter().pickDocument()).rejects.toMatchObject({
      cause: permissionError,
    })
  })
})
