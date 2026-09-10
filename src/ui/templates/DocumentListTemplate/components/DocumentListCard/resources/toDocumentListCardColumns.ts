import type { TranslateType } from '@services/translate'
import { ChainIcon, UserGroupIcon } from '@ui/atoms/icons'
import type { CardListItemProps } from '@ui/molecules/CardListItem'

import type { DocumentListItemModel } from '../../../models'

export interface DocumentListCardColumnsModel {
  document: DocumentListItemModel
  translate: TranslateType
}

export const toDocumentListCardColumns = ({
  document,
  translate,
}: DocumentListCardColumnsModel): CardListItemProps['columns'] => [
  {
    icon: UserGroupIcon,
    title: translate('_DOCUMENT_LIST_TEMPLATE_CONTRIBUTORS'),
    items: document.contributors,
  },
  {
    icon: ChainIcon,
    title: translate('_DOCUMENT_LIST_TEMPLATE_ATTACHMENTS'),
    items: document.attachments,
  },
]
