import type { NotificationEntryModel } from '@context'
import { languageService } from '@services/language'
import { translateService } from '@services/translate'
import type { NotificationListItemModel } from '@ui/templates/notificationListTemplate'

const NOTIFICATION_TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

const isReadableDate = (date: Date): boolean => !Number.isNaN(date.getTime())

export const toNotificationTimestampLabel = (timestamp: string): string => {
  const date = new Date(timestamp)

  if (!isReadableDate(date)) return timestamp

  return new Intl.DateTimeFormat(
    languageService.getLanguage(),
    NOTIFICATION_TIMESTAMP_OPTIONS,
  ).format(date)
}

export const toNotificationListItem = (
  notification: NotificationEntryModel,
): NotificationListItemModel => ({
  id: notification.id,
  title: notification.documentTitle,
  description: translateService.translate('_NOTIFICATION_LIST_SCREEN_DESCRIPTION', {
    userName: notification.userName,
  }),
  timestamp: toNotificationTimestampLabel(notification.timestamp),
})

export const toNotificationListItems = (
  notifications: readonly NotificationEntryModel[],
): readonly NotificationListItemModel[] =>
  notifications.map((notification) => toNotificationListItem(notification))
