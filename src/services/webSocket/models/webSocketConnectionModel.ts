export interface WebSocketConnectionModel {
  readonly send: (message: unknown) => void
  readonly close: () => void
}
