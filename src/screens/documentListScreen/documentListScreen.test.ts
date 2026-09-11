import { ViewSectionStatusTypes } from '@core/views/documentListView'
import { documentListItemsMock } from '@core/views/documentListView/mocks/documentListViewMock'
import { DocumentListLayoutTypes, DocumentListStateTypes } from '@ui/templates/documentListTemplate'

import { DOCUMENT_LIST_LAYOUT_STORAGE_KEY } from './resources/constants'
import {
  loadDocumentListState,
  logDocumentListError,
  readDocumentListLayout,
  refreshDocumentListState,
  restoreDocumentListLayout,
  saveDocumentListLayout,
} from './resources/services'
import { toDocumentListLayout, toDocumentListState } from './resources/utils'

jest.mock('@services/http', () => ({
  httpService: { get: jest.fn() },
}))

jest.mock('@services/storage', () => ({
  storageService: { getItem: jest.fn(), setItem: jest.fn() },
}))

jest.mock('@core/views/documentListView', () => ({
  ...jest.requireActual('@core/views/documentListView'),
  loadDocumentListView: jest.fn(),
}))

const { loadDocumentListView } = jest.requireMock('@core/views/documentListView')
const loadDocumentListViewMock = loadDocumentListView as jest.Mock

const { storageService } = jest.requireMock('@services/storage') as {
  storageService: {
    getItem: jest.Mock
    setItem: jest.Mock
  }
}

const okSection = { status: ViewSectionStatusTypes.Ok, data: documentListItemsMock } as const

const errorSection = {
  status: ViewSectionStatusTypes.Error,
  message: 'The documents could not be loaded.',
  cause: new Error('boom'),
} as const

const abortedSection = { status: ViewSectionStatusTypes.Aborted } as const

beforeEach(() => {
  loadDocumentListViewMock.mockReset()
  storageService.getItem.mockReset().mockResolvedValue(null)
  storageService.setItem.mockReset().mockResolvedValue(undefined)
})

describe('toDocumentListState', () => {
  it('passes the view items straight through as content', () => {
    expect(toDocumentListState(okSection)).toEqual({
      type: DocumentListStateTypes.Content,
      documents: documentListItemsMock,
    })
  })

  it('carries the controlled message into the error state', () => {
    expect(toDocumentListState(errorSection)).toEqual({
      type: DocumentListStateTypes.Error,
      message: 'The documents could not be loaded.',
    })
  })

  it('has no state to paint for an aborted section', () => {
    expect(toDocumentListState(abortedSection)).toBeNull()
  })
})

describe('logDocumentListError', () => {
  it('logs the raw cause of a failed section', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    logDocumentListError(errorSection)

    expect(consoleErrorSpy).toHaveBeenCalledWith(errorSection.cause)
    consoleErrorSpy.mockRestore()
  })

  it('stays quiet for an abort, which is not a failure', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    logDocumentListError(abortedSection)

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('loadDocumentListState', () => {
  it('forwards the signal and applies the resulting state', async () => {
    const abortController = new AbortController()
    const setState = jest.fn()
    loadDocumentListViewMock.mockResolvedValue({ documents: okSection })

    await loadDocumentListState(setState, abortController.signal)

    expect(loadDocumentListViewMock).toHaveBeenCalledWith(abortController.signal)
    expect(setState).toHaveBeenCalledWith({
      type: DocumentListStateTypes.Content,
      documents: documentListItemsMock,
    })
  })

  it('does not touch the state when the load was aborted', async () => {
    const setState = jest.fn()
    loadDocumentListViewMock.mockResolvedValue({ documents: abortedSection })

    await loadDocumentListState(setState, new AbortController().signal)

    expect(setState).not.toHaveBeenCalled()
  })
})

describe('refreshDocumentListState', () => {
  it('raises the refreshing flag, applies the state and lowers it again', async () => {
    const setState = jest.fn()
    const setIsRefreshing = jest.fn()
    loadDocumentListViewMock.mockResolvedValue({ documents: okSection })

    await refreshDocumentListState({
      setState,
      setIsRefreshing,
      signal: new AbortController().signal,
    })

    expect(setIsRefreshing.mock.calls).toEqual([[true], [false]])
    expect(setState).toHaveBeenCalledWith({
      type: DocumentListStateTypes.Content,
      documents: documentListItemsMock,
    })
  })

  it('replaces the documents with the controlled message when the reload fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const setState = jest.fn()
    const setIsRefreshing = jest.fn()
    loadDocumentListViewMock.mockResolvedValue({ documents: errorSection })

    await refreshDocumentListState({
      setState,
      setIsRefreshing,
      signal: new AbortController().signal,
    })

    expect(setState).toHaveBeenCalledWith({
      type: DocumentListStateTypes.Error,
      message: 'The documents could not be loaded.',
    })
    consoleErrorSpy.mockRestore()
  })

  it('lowers the refreshing flag even when the reload was aborted', async () => {
    const setState = jest.fn()
    const setIsRefreshing = jest.fn()
    loadDocumentListViewMock.mockResolvedValue({ documents: abortedSection })

    await refreshDocumentListState({
      setState,
      setIsRefreshing,
      signal: new AbortController().signal,
    })

    expect(setState).not.toHaveBeenCalled()
    expect(setIsRefreshing.mock.calls).toEqual([[true], [false]])
  })
})

describe('toDocumentListLayout', () => {
  it('restores a stored value that names a layout', () => {
    expect(toDocumentListLayout('grid')).toBe(DocumentListLayoutTypes.Grid)
  })

  it('has nothing to restore when the layout was never stored', () => {
    expect(toDocumentListLayout(null)).toBeNull()
  })

  it('discards a stored value that no longer names a layout', () => {
    expect(toDocumentListLayout('carousel')).toBeNull()
  })
})

describe('readDocumentListLayout', () => {
  it('reads the layout from its own storage key', async () => {
    storageService.getItem.mockResolvedValue(DocumentListLayoutTypes.Grid)

    await expect(readDocumentListLayout()).resolves.toBe(DocumentListLayoutTypes.Grid)
    expect(storageService.getItem).toHaveBeenCalledWith(DOCUMENT_LIST_LAYOUT_STORAGE_KEY)
  })

  it('opens on no layout at all when the storage read fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    storageService.getItem.mockRejectedValue(new Error('storage unavailable'))

    await expect(readDocumentListLayout()).resolves.toBeNull()

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('saveDocumentListLayout', () => {
  it('stores the selected layout under its own key', async () => {
    await saveDocumentListLayout(DocumentListLayoutTypes.Grid)

    expect(storageService.setItem).toHaveBeenCalledWith(
      DOCUMENT_LIST_LAYOUT_STORAGE_KEY,
      DocumentListLayoutTypes.Grid,
    )
  })

  it('keeps the selection on screen when it could not be stored', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    storageService.setItem.mockRejectedValue(new Error('quota exceeded'))

    await expect(saveDocumentListLayout(DocumentListLayoutTypes.Grid)).resolves.toBeUndefined()

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('restoreDocumentListLayout', () => {
  it('applies the layout the previous session left behind', async () => {
    const setLayout = jest.fn()
    storageService.getItem.mockResolvedValue(DocumentListLayoutTypes.Grid)

    await restoreDocumentListLayout(setLayout)

    expect(setLayout).toHaveBeenCalledWith(DocumentListLayoutTypes.Grid)
  })

  it('leaves the default layout untouched when nothing was stored', async () => {
    const setLayout = jest.fn()

    await restoreDocumentListLayout(setLayout)

    expect(setLayout).not.toHaveBeenCalled()
  })
})
