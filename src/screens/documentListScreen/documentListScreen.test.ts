import { ViewSectionStatusTypes } from '@core/views/documentListView'
import { documentListItemsMock } from '@core/views/documentListView/mocks/documentListViewMock'
import { DocumentListStateTypes } from '@ui/templates/documentListTemplate'

import { loadDocumentListState, logDocumentListError, refreshDocumentListState } from './resources/services'
import { toDocumentListState } from './resources/utils'

jest.mock('@services/http', () => ({
  httpService: { get: jest.fn() },
}))

jest.mock('@core/views/documentListView', () => ({
  ...jest.requireActual('@core/views/documentListView'),
  loadDocumentListView: jest.fn(),
}))

const { loadDocumentListView } = jest.requireMock('@core/views/documentListView')
const loadDocumentListViewMock = loadDocumentListView as jest.Mock

const okSection = { status: ViewSectionStatusTypes.Ok, data: documentListItemsMock } as const

const errorSection = {
  status: ViewSectionStatusTypes.Error,
  message: 'The documents could not be loaded.',
  cause: new Error('boom'),
} as const

const abortedSection = { status: ViewSectionStatusTypes.Aborted } as const

beforeEach(() => {
  loadDocumentListViewMock.mockReset()
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
