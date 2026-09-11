export const WebSocketStatusTypes = {
  Closed: 'closed',
  Connecting: 'connecting',
  Open: 'open',
  Reconnecting: 'reconnecting',
} as const

export type WebSocketStatusTypes = (typeof WebSocketStatusTypes)[keyof typeof WebSocketStatusTypes]
