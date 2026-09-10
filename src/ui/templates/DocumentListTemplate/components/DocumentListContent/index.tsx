import { useTranslate } from '@hooks/useTranslate'
import { List } from '@ui/molecules/List'

import type { DocumentListItemModel, DocumentListLayoutTypes } from '../../models'
import { toDocumentListColumns } from '../../resources/toDocumentListColumns'
import { DocumentListCard } from '../DocumentListCard'
import { DocumentListMessage } from '../DocumentListMessage'

export interface DocumentListContentProps {
  documents: readonly DocumentListItemModel[]
  layout: DocumentListLayoutTypes
}

export const DocumentListContent = ({ documents, layout }: DocumentListContentProps) => {
  const translate = useTranslate()

  return (
    <List
      items={documents}
      columns={toDocumentListColumns(layout)}
      keyExtractor={(document) => document.id}
      renderItem={(document) => <DocumentListCard document={document} layout={layout} />}
      empty={<DocumentListMessage message={translate('_DOCUMENT_LIST_TEMPLATE_EMPTY')} />}
    />
  )
}
