import type { WebSocketErrorDetailsModel } from '@services/webSocket'
import type { WebSocketErrorTypes } from '@services/webSocket'

export class WebSocketError extends Error implements WebSocketErrorDetailsModel {
  readonly type: WebSocketErrorTypes
  readonly code: number | null

  constructor(message: string, details: WebSocketErrorDetailsModel) {
    super(message)
    this.name = 'WebSocketError'
    this.type = details.type
    this.code = details.code
  }
}
