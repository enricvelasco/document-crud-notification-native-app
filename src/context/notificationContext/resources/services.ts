import {
  type NotificationError,
  type NotificationModel,
  type NotificationSubscriptionModel,
  subscribeToNotifications,
} from '@core/domains/notification'

import type { NotificationStreamControllerModel } from '@context'

const NOTIFICATION_LOG_LABEL = '[notification]'

export type OnNotificationType = (notification: NotificationModel) => void

export const logNotification = (notification: NotificationModel): void =>
  console.log(NOTIFICATION_LOG_LABEL, notification)

export const logNotificationError = (error: NotificationError): void =>
  console.error(NOTIFICATION_LOG_LABEL, error)

export const createNotificationStreamController = (
  onNotification: OnNotificationType,
): NotificationStreamControllerModel => {
  let subscription: NotificationSubscriptionModel | null = null

  const start = (): void => {
    if (subscription) return

    subscription = subscribeToNotifications({ onNotification, onError: logNotificationError })
  }

  const stop = (): void => {
    if (!subscription) return

    subscription.close()
    subscription = null
  }

  return { start, stop }
}
