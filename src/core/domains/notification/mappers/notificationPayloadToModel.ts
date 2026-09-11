import type { NotificationModel, NotificationPayloadModel } from '../models'

export const notificationPayloadToModel = (payload: NotificationPayloadModel): NotificationModel => ({
  timestamp: payload.Timestamp,
  userId: payload.UserID,
  userName: payload.UserName,
  documentId: payload.DocumentID,
  documentTitle: payload.DocumentTitle,
})
