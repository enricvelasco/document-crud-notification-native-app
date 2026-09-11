import {
  type DocumentListLayoutTypes,
  type DocumentListSortTypes,
  type DocumentListStateModel,
  DocumentListStateTypes,
} from '../../models'
import { sortDocumentList } from '../../resources/sortDocumentList'
import { DocumentListContent } from '../documentListContent'
import { DocumentListLoading } from '../documentListLoading'
import { DocumentListMessage } from '../documentListMessage'

export interface DocumentListBodyProps {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  layout: DocumentListLayoutTypes
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const DocumentListBody = ({ state, sort, layout, isRefreshing, onRefresh }: DocumentListBodyProps) => {
  if (state.type === DocumentListStateTypes.Loading) return <DocumentListLoading />

  if (state.type === DocumentListStateTypes.Error) {
    return <DocumentListMessage message={state.message} />
  }

  return (
    <DocumentListContent
      documents={sortDocumentList(state.documents, sort)}
      layout={layout}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  )
}
