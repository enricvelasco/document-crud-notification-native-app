import { type WebSocketError, webSocketService } from '@services/webSocket'

import { notificationPayloadToModel } from '../mappers/notificationPayloadToModel'
import { NotificationError, type NotificationPayloadModel, type SubscribeToNotificationsType } from '../models'

const NOTIFICATION_PATH = '/notifications'

export const subscribeToNotifications: SubscribeToNotificationsType = (options) => {
  const handleMessage = (payload: NotificationPayloadModel): void =>
    options.onNotification(notificationPayloadToModel(payload))

  const handleError = (error: WebSocketError): void =>
    options.onError?.(new NotificationError('The notification stream failed.', { cause: error }))

  try {
    const connection = webSocketService.connect<NotificationPayloadModel>(NOTIFICATION_PATH, {
      onMessage: handleMessage,
      onStatusChange: options.onStatusChange,
      onError: handleError,
    })

    return { close: connection.close }
  } catch (error) {
    throw new NotificationError('The notification stream could not be opened.', { cause: error })
  }
}
