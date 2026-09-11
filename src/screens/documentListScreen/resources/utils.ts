import { type DocumentListViewModel, ViewSectionStatusTypes } from '@core/views/documentListView'
import { type DocumentListStateModel, DocumentListStateTypes } from '@ui/templates/documentListTemplate'

export const toDocumentListState = (
  documents: DocumentListViewModel['documents'],
): DocumentListStateModel | null => {
  if (documents.status === ViewSectionStatusTypes.Aborted) return null

  if (documents.status === ViewSectionStatusTypes.Error) {
    return { type: DocumentListStateTypes.Error, message: documents.message }
  }

  return { type: DocumentListStateTypes.Content, documents: documents.data }
}
