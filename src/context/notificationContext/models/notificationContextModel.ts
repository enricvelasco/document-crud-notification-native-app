import type { NotificationEntryModel } from './notificationEntryModel'

export interface NotificationContextModel {
  readonly notifications: readonly NotificationEntryModel[]
  readonly count: number
  readonly isError: boolean
  readonly markAsRead: () => void
  readonly startSubscription: () => void
  readonly stopSubscription: () => void
}
