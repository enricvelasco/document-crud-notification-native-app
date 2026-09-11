import type { NotificationModel } from '@core/domains/notification'

export interface NotificationEntryModel extends NotificationModel {
  readonly id: string
}
