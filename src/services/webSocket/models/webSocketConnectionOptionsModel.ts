import type { WebSocketError } from './webSocketError'
import type { WebSocketStatusTypes } from '@services/webSocket'

export interface WebSocketConnectionOptionsModel<TMessage> {
  readonly onMessage: (message: TMessage) => void
  readonly onStatusChange?: (status: WebSocketStatusTypes) => void
  readonly onError?: (error: WebSocketError) => void
}
