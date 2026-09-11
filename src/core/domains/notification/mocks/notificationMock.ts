import type { NotificationModel, NotificationPayloadModel } from '../models'

export const notificationPayloadMock: NotificationPayloadModel = {
  Timestamp: '2020-08-12T07:30:08.28093+02:00',
  UserID: '3ffe27e5-fe2c-45ea-8b3c-879b757b0455',
  UserName: 'Alicia Wolf',
  DocumentID: 'f09acc46-3875-4eff-8831-10ccf3356420',
  DocumentTitle: 'Edmund Fitzgerald Porter',
}

export const notificationMock: NotificationModel = {
  timestamp: '2020-08-12T07:30:08.28093+02:00',
  userId: '3ffe27e5-fe2c-45ea-8b3c-879b757b0455',
  userName: 'Alicia Wolf',
  documentId: 'f09acc46-3875-4eff-8831-10ccf3356420',
  documentTitle: 'Edmund Fitzgerald Porter',
}
