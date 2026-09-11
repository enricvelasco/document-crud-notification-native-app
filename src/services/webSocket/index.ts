import { appConfig } from '@config'

import { createNativeWebSocketAdapter } from './adapters/nativeWebSocketAdapter'
import {
  WEB_SOCKET_CONNECTION_TIMEOUT_MS,
  WEB_SOCKET_MAX_RECONNECT_ATTEMPTS,
  WEB_SOCKET_MAX_RECONNECT_DELAY_MS,
  WEB_SOCKET_RECONNECT_DELAY_MS,
} from './constants'

export * from './models'

export const webSocketService = createNativeWebSocketAdapter({
  baseUrl: appConfig.webSocketUrl,
  connectionTimeoutMs: WEB_SOCKET_CONNECTION_TIMEOUT_MS,
  reconnectDelayMs: WEB_SOCKET_RECONNECT_DELAY_MS,
  maxReconnectDelayMs: WEB_SOCKET_MAX_RECONNECT_DELAY_MS,
  maxReconnectAttempts: WEB_SOCKET_MAX_RECONNECT_ATTEMPTS,
})
