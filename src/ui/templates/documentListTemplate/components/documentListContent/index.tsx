import { useTranslate } from '@hooks/useTranslate'
import { List } from '@ui/molecules/list'

import type { DocumentListItemModel, DocumentListLayoutTypes } from '../../models'
import { toDocumentListColumns } from '../../resources/toDocumentListColumns'
import { DocumentListCard } from '../documentListCard'
import { DocumentListMessage } from '../documentListMessage'

export interface DocumentListContentProps {
  documents: readonly DocumentListItemModel[]
  layout: DocumentListLayoutTypes
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const DocumentListContent = ({
  documents,
  layout,
  isRefreshing,
  onRefresh,
}: DocumentListContentProps) => {
  const translate = useTranslate()

  return (
    <List
      items={documents}
      columns={toDocumentListColumns(layout)}
      keyExtractor={(document) => document.id}
      renderItem={(document) => <DocumentListCard document={document} layout={layout} />}
      empty={<DocumentListMessage message={translate('_DOCUMENT_LIST_TEMPLATE_EMPTY')} />}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  )
}
