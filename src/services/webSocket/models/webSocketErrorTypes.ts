export const WebSocketErrorTypes = {
  Closed: 'closed',
  Connection: 'connection',
  Parse: 'parse',
  Send: 'send',
  Timeout: 'timeout',
} as const

export type WebSocketErrorTypes = (typeof WebSocketErrorTypes)[keyof typeof WebSocketErrorTypes]
