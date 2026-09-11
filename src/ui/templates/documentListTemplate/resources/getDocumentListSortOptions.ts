import type { TranslateType } from '@services/translate'
import type { DropdownOptionModel } from '@ui/molecules/dropdownButton'

import { DocumentListSortTypes } from '../models'

export const getDocumentListSortOptions = (
  translate: TranslateType,
): readonly DropdownOptionModel[] => [
  { value: DocumentListSortTypes.NameAsc, label: translate('_DOCUMENT_LIST_TEMPLATE_SORT_NAME_ASC') },
  { value: DocumentListSortTypes.NameDesc, label: translate('_DOCUMENT_LIST_TEMPLATE_SORT_NAME_DESC') },
]
