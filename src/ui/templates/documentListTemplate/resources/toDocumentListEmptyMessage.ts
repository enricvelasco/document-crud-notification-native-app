import type { TranslateType } from '@services/translate'

import { type DocumentListStateModel, DocumentListStateTypes } from '../models'

export const toDocumentListEmptyMessage = (
  state: DocumentListStateModel,
  translate: TranslateType,
): string =>
  state.type === DocumentListStateTypes.Error
    ? state.message
    : translate('_DOCUMENT_LIST_TEMPLATE_EMPTY')
