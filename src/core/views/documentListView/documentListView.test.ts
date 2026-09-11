import { getDocumentList } from '@core/domains/document'
import { getDocumentListResponseMock } from '@core/domains/document/mocks/documentMock'
import en from '@translations/en.json'

import { documentListToViewModel } from './mappers/documentListToViewModel'
import {
  documentListAbortedResultsMock,
  documentListItemsMock,
  documentListRejectedResultMock,
  documentListRejectedResultsMock,
  documentListResultsMock,
} from './mocks/documentListViewMock'
import { ViewSectionStatusTypes } from './models'
import { loadDocumentListView } from './view'

jest.mock('@services/http', () => ({
  httpService: { get: jest.fn() },
}))

jest.mock('@core/domains/document', () => ({
  ...jest.requireActual('@core/domains/document'),
  getDocumentList: jest.fn(),
}))

jest.mock('@services/translate', () => {
  const catalog: Record<string, string> = jest.requireActual('@translations/en.json')

  return {
    translateService: {
      translate: (key: string, params?: Record<string, string>): string =>
        Object.entries(params ?? {}).reduce(
          (copy, [name, value]) => copy.replace(`{{${name}}}`, value),
          catalog[key],
        ),
    },
  }
})

const getDocumentListMock = getDocumentList as jest.Mock

beforeEach(() => {
  getDocumentListMock.mockReset()
})

describe('documentListToViewModel', () => {
  it('maps a fulfilled result to the exact shape the screen paints', () => {
    const view = documentListToViewModel(documentListResultsMock)

    expect(view.documents).toEqual({
      status: ViewSectionStatusTypes.Ok,
      data: documentListItemsMock,
    })
  })

  it('flattens contributors to their names and keeps attachments untouched', () => {
    const view = documentListToViewModel(documentListResultsMock)

    if (view.documents.status !== ViewSectionStatusTypes.Ok) throw new Error('expected ok section')

    expect(view.documents.data[0].contributors).toEqual([
      'Cyril Huels',
      'Giovanni Runolfsson',
      'Elton Fahey',
      'Zula Willms',
    ])
    expect(view.documents.data[0].attachments).toEqual(
      documentListItemsMock[0].attachments,
    )
  })

  it('builds the description from the document version', () => {
    const view = documentListToViewModel(documentListResultsMock)

    if (view.documents.status !== ViewSectionStatusTypes.Ok) throw new Error('expected ok section')

    expect(view.documents.data[0].description).toBe('Version 1.14.2')
  })

  it('turns a rejected result into a controlled message keeping the raw cause', () => {
    const view = documentListToViewModel(documentListRejectedResultsMock)

    expect(view.documents).toEqual({
      status: ViewSectionStatusTypes.Error,
      message: en._DOCUMENT_LIST_VIEW_LOAD_ERROR,
      cause: documentListRejectedResultMock.reason,
    })
  })

  it('reports an abort instead of an error when the screen cancelled the load', () => {
    const view = documentListToViewModel(documentListAbortedResultsMock)

    expect(view.documents).toEqual({ status: ViewSectionStatusTypes.Aborted })
  })
})

describe('loadDocumentListView', () => {
  it('forwards the abort signal to the domain', async () => {
    const abortController = new AbortController()
    getDocumentListMock.mockResolvedValue(getDocumentListResponseMock)

    await loadDocumentListView(abortController.signal)

    expect(getDocumentListMock).toHaveBeenCalledWith(abortController.signal)
  })

  it('does not reject when the domain call fails', async () => {
    getDocumentListMock.mockRejectedValue(documentListRejectedResultMock.reason)

    const view = await loadDocumentListView()

    expect(view.documents.status).toBe(ViewSectionStatusTypes.Error)
  })

  it('reports an abort when the signal was already aborted', async () => {
    const abortController = new AbortController()
    abortController.abort()
    getDocumentListMock.mockRejectedValue(documentListRejectedResultMock.reason)

    const view = await loadDocumentListView(abortController.signal)

    expect(view.documents.status).toBe(ViewSectionStatusTypes.Aborted)
  })
})
