import type { NotificationModel } from '@core/domains/notification'

export interface NotificationStreamControllerOptionsModel {
  readonly onNotification: (notification: NotificationModel) => void
  readonly onFailureLimitReached: () => void
}
