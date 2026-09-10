import type { TranslateType } from '@services/translate'
import type { DropdownOptionModel } from '@ui/molecules/DropdownButton'

import { DocumentListSortTypes } from '../models'

export const getDocumentListSortOptions = (
  translate: TranslateType,
): readonly DropdownOptionModel[] => [
  { value: DocumentListSortTypes.Title, label: translate('_DOCUMENT_LIST_TEMPLATE_SORT_TITLE') },
  { value: DocumentListSortTypes.Recent, label: translate('_DOCUMENT_LIST_TEMPLATE_SORT_RECENT') },
]
