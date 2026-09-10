import type { TranslateType } from '@services/translate'
import { GridIcon, ListIcon } from '@ui/atoms/icons'
import type { OptionsButtonOptionModel } from '@ui/molecules/OptionsButton'

import { DocumentListLayoutTypes } from '../models'

export const getDocumentListLayoutOptions = (
  translate: TranslateType,
): readonly OptionsButtonOptionModel[] => [
  {
    value: DocumentListLayoutTypes.List,
    icon: ListIcon,
    accessibilityLabel: translate('_DOCUMENT_LIST_TEMPLATE_LAYOUT_LIST'),
  },
  {
    value: DocumentListLayoutTypes.Grid,
    icon: GridIcon,
    accessibilityLabel: translate('_DOCUMENT_LIST_TEMPLATE_LAYOUT_GRID'),
  },
]
