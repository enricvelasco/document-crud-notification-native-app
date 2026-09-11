import type { NotificationSubscriptionModel } from '@core/domains/notification'
import type { SubscribeToNotificationsOptionsModel } from '@core/domains/notification'

export type SubscribeToNotificationsType = (
  options: SubscribeToNotificationsOptionsModel,
) => NotificationSubscriptionModel
