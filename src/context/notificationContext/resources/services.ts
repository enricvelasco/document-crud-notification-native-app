import type { NotificationEntryModel, NotificationStreamControllerModel, NotificationStreamControllerOptionsModel } from '@context'
import {
  type NotificationError,
  type NotificationModel,
  type NotificationSubscriptionModel,
  subscribeToNotifications,
} from '@core/domains/notification'

const NOTIFICATION_LOG_LABEL = '[notification]'

const INITIAL_FAILURE_COUNT = 0

export const MAX_NOTIFICATION_FAILURES = 3

const hasReachedFailureLimit = (failureCount: number): boolean =>
  failureCount >= MAX_NOTIFICATION_FAILURES

export const logNotification = (notification: NotificationModel): void =>
  console.log(NOTIFICATION_LOG_LABEL, notification)

export const logNotificationError = (error: NotificationError): void =>
  console.error(NOTIFICATION_LOG_LABEL, error)

export const toNotificationEntry = (
  notification: NotificationModel,
  sequence: number,
): NotificationEntryModel => ({ ...notification, id: `${sequence}-${notification.documentId}` })

export const addNotificationEntry = (
  notifications: readonly NotificationEntryModel[],
  notification: NotificationModel,
): readonly NotificationEntryModel[] =>
  [toNotificationEntry(notification, notifications.length), ...notifications]

interface NotificationStreamStateModel {
  subscription: NotificationSubscriptionModel | null
  failureCount: number
}

export const createNotificationStreamController = (
  options: NotificationStreamControllerOptionsModel,
): NotificationStreamControllerModel => {
  const state: NotificationStreamStateModel = {
    subscription: null,
    failureCount: INITIAL_FAILURE_COUNT,
  }

  const stop = (): void => {
    if (!state.subscription) return

    state.subscription.close()
    state.subscription = null
  }

  const handleNotification = (notification: NotificationModel): void => {
    state.failureCount = INITIAL_FAILURE_COUNT
    options.onNotification(notification)
  }

  const handleError = (error: NotificationError): void => {
    if (hasReachedFailureLimit(state.failureCount)) return

    logNotificationError(error)
    state.failureCount += 1

    if (!hasReachedFailureLimit(state.failureCount)) return

    stop()
    options.onFailureLimitReached()
  }

  const start = (): void => {
    if (state.subscription) return

    state.failureCount = INITIAL_FAILURE_COUNT
    state.subscription = subscribeToNotifications({
      onNotification: handleNotification,
      onError: handleError,
    })
  }

  return { start, stop }
}
