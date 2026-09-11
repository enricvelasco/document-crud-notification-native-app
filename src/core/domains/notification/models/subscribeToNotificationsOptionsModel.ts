import type { WebSocketStatusTypes } from '@services/webSocket'

import type { NotificationError } from './notificationError'
import type { NotificationModel } from './notificationModel'

export interface SubscribeToNotificationsOptionsModel {
  readonly onNotification: (notification: NotificationModel) => void
  readonly onStatusChange?: (status: WebSocketStatusTypes) => void
  readonly onError?: (error: NotificationError) => void
}
