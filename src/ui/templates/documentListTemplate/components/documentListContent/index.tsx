import { List } from '@ui/molecules/list'

import type { DocumentListItemModel, DocumentListLayoutTypes } from '../../models'
import { toDocumentListColumns } from '../../resources/toDocumentListColumns'
import { DocumentListCard } from '../documentListCard'
import { DocumentListMessage } from '../documentListMessage'

export interface DocumentListContentProps {
  documents: readonly DocumentListItemModel[]
  emptyMessage: string
  layout: DocumentListLayoutTypes
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const DocumentListContent = ({
  documents,
  emptyMessage,
  layout,
  isRefreshing,
  onRefresh,
}: DocumentListContentProps) => (
  <List
    items={documents}
    columns={toDocumentListColumns(layout)}
    keyExtractor={(document) => document.id}
    renderItem={(document) => <DocumentListCard document={document} layout={layout} />}
    empty={<DocumentListMessage message={emptyMessage} />}
    isRefreshing={isRefreshing}
    onRefresh={onRefresh}
  />
)
