export interface NotificationContextModel {
  readonly count: number
  readonly startSubscription: () => void
  readonly stopSubscription: () => void
}
