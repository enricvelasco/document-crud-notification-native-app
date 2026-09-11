export interface NotificationContextModel {
  readonly count: number
  readonly isError: boolean
  readonly startSubscription: () => void
  readonly stopSubscription: () => void
}
