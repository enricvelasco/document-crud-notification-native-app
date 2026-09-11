export interface WebSocketClientConfigModel {
  readonly baseUrl: string
  readonly connectionTimeoutMs: number
  readonly reconnectDelayMs: number
  readonly maxReconnectDelayMs: number
  readonly maxReconnectAttempts: number
}
