import { useTranslate } from '@hooks/useTranslate'

import {
  type DocumentListLayoutTypes,
  type DocumentListSortTypes,
  type DocumentListStateModel,
  DocumentListStateTypes,
} from '../../models'
import { sortDocumentList } from '../../resources/sortDocumentList'
import { toDocumentListDocuments } from '../../resources/toDocumentListDocuments'
import { toDocumentListEmptyMessage } from '../../resources/toDocumentListEmptyMessage'
import { DocumentListContent } from '../documentListContent'
import { DocumentListLoading } from '../documentListLoading'

export interface DocumentListBodyProps {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  layout: DocumentListLayoutTypes
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const DocumentListBody = ({ state, sort, layout, isRefreshing, onRefresh }: DocumentListBodyProps) => {
  const translate = useTranslate()

  if (state.type === DocumentListStateTypes.Loading) return <DocumentListLoading />

  return (
    <DocumentListContent
      documents={sortDocumentList(toDocumentListDocuments(state), sort)}
      emptyMessage={toDocumentListEmptyMessage(state, translate)}
      layout={layout}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  )
}
