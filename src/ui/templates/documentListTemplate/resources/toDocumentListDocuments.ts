import { type DocumentListItemModel, type DocumentListStateModel, DocumentListStateTypes } from '../models'

export const toDocumentListDocuments = (
  state: DocumentListStateModel,
): readonly DocumentListItemModel[] =>
  state.type === DocumentListStateTypes.Content ? state.documents : []
