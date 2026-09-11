import { type DocumentListViewModel, ViewSectionStatusTypes } from '@core/views/documentListView'
import {
  type DocumentListLayoutTypes,
  type DocumentListStateModel,
  DocumentListStateTypes,
  isDocumentListLayout,
} from '@ui/templates/documentListTemplate'

export const toDocumentListState = (
  documents: DocumentListViewModel['documents'],
): DocumentListStateModel | null => {
  if (documents.status === ViewSectionStatusTypes.Aborted) return null

  if (documents.status === ViewSectionStatusTypes.Error) {
    return { type: DocumentListStateTypes.Error, message: documents.message }
  }

  return { type: DocumentListStateTypes.Content, documents: documents.data }
}

export const toDocumentListLayout = (
  storedLayout: string | null,
): DocumentListLayoutTypes | null =>
  storedLayout !== null && isDocumentListLayout(storedLayout) ? storedLayout : null
