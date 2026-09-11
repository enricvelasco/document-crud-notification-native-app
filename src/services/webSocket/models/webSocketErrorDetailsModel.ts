import type { WebSocketErrorTypes } from '@services/webSocket'

export interface WebSocketErrorDetailsModel {
  readonly type: WebSocketErrorTypes
  readonly code: number | null
}
