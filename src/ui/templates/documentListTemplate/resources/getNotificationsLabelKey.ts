import type { TranslationKeyType } from '@translations'

export const getNotificationsLabelKey = (hasError: boolean): TranslationKeyType =>
  hasError ? '_DOCUMENT_LIST_TEMPLATE_NOTIFICATIONS_ERROR' : '_DOCUMENT_LIST_TEMPLATE_NOTIFICATIONS'
