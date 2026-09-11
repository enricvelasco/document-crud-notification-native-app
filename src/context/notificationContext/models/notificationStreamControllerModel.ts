export interface NotificationStreamControllerModel {
  readonly start: () => void
  readonly stop: () => void
  readonly fail: () => void
}
