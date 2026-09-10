import { useTranslate } from '@hooks/useTranslate'
import { CardGridItem } from '@ui/molecules/CardGridItem'
import { CardListItem } from '@ui/molecules/CardListItem'

import { type DocumentListItemModel, DocumentListLayoutTypes } from '../../models'
import { toDocumentListCardColumns } from './resources/toDocumentListCardColumns'

export interface DocumentListCardProps {
  document: DocumentListItemModel
  layout: DocumentListLayoutTypes
}

export const DocumentListCard = ({ document, layout }: DocumentListCardProps) => {
  const translate = useTranslate()

  if (layout === DocumentListLayoutTypes.Grid) {
    return <CardGridItem title={document.title} description={document.description} />
  }

  return (
    <CardListItem
      title={document.title}
      description={document.description}
      columns={toDocumentListCardColumns({ document, translate })}
    />
  )
}
