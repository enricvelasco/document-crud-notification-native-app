import {
  type WebSocketClientConfigModel,
  type WebSocketConnectionModel,
  type WebSocketConnectionOptionsModel,
  WebSocketError,
  WebSocketErrorTypes,
  type WebSocketServiceModel,
  WebSocketStatusTypes,
} from '../models'

const WEB_SOCKET_OPEN_STATE = 1

export interface WebSocketMessageEventModel {
  readonly data: unknown
}

export interface WebSocketCloseEventModel {
  readonly code: number
}

export interface WebSocketConnectionContextModel<TMessage> {
  readonly url: string
  readonly config: WebSocketClientConfigModel
  readonly options: WebSocketConnectionOptionsModel<TMessage>
}

const toConnectionError = (url: string): WebSocketError =>
  new WebSocketError(`Connection to ${url} could not be established.`, {
    type: WebSocketErrorTypes.Connection,
    code: null,
  })

const toTimeoutError = (url: string): WebSocketError =>
  new WebSocketError(`Connection to ${url} timed out.`, {
    type: WebSocketErrorTypes.Timeout,
    code: null,
  })

const toParseError = (url: string): WebSocketError =>
  new WebSocketError(`Message from ${url} is not valid JSON.`, {
    type: WebSocketErrorTypes.Parse,
    code: null,
  })

const toSendError = (url: string): WebSocketError =>
  new WebSocketError(`Message could not be sent to ${url} because the connection is not open.`, {
    type: WebSocketErrorTypes.Send,
    code: null,
  })

const toClosedError = (url: string, code: number): WebSocketError =>
  new WebSocketError(`Connection to ${url} closed with code ${code} and will not reconnect.`, {
    type: WebSocketErrorTypes.Closed,
    code,
  })

const toBaseUrlWithoutTrailingSlash = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

const toConnectionUrl = (baseUrl: string, path: string): string =>
  `${toBaseUrlWithoutTrailingSlash(baseUrl)}${path}`

const toReconnectDelayMs = (config: WebSocketClientConfigModel, attempt: number): number =>
  Math.min(config.reconnectDelayMs * 2 ** (attempt - 1), config.maxReconnectDelayMs)

const createConnection = <TMessage,>(
  context: WebSocketConnectionContextModel<TMessage>,
): WebSocketConnectionModel => {
  let socket: WebSocket | null = null
  let reconnectAttempt = 0
  let isClosedByCaller = false
  let openTimeoutId: ReturnType<typeof setTimeout> | undefined
  let reconnectTimeoutId: ReturnType<typeof setTimeout> | undefined

  const notifyStatus = (status: WebSocketStatusTypes): void =>
    context.options.onStatusChange?.(status)

  const notifyError = (error: WebSocketError): void => context.options.onError?.(error)

  const canReconnect = (): boolean =>
    !isClosedByCaller && reconnectAttempt < context.config.maxReconnectAttempts

  const handleOpen = (): void => {
    clearTimeout(openTimeoutId)
    reconnectAttempt = 0
    notifyStatus(WebSocketStatusTypes.Open)
  }

  const handleMessage = (event: WebSocketMessageEventModel): void => {
    let message: TMessage

    try {
      message = JSON.parse(String(event.data)) as TMessage
    } catch {
      notifyError(toParseError(context.url))

      return
    }

    context.options.onMessage(message)
  }

  const handleError = (): void => notifyError(toConnectionError(context.url))

  const scheduleReconnect = (): void => {
    reconnectAttempt += 1
    notifyStatus(WebSocketStatusTypes.Reconnecting)
    reconnectTimeoutId = setTimeout(
      () => openSocket(),
      toReconnectDelayMs(context.config, reconnectAttempt),
    )
  }

  const handleClose = (event: WebSocketCloseEventModel): void => {
    clearTimeout(openTimeoutId)
    socket = null

    if (canReconnect()) {
      scheduleReconnect()

      return
    }

    notifyStatus(WebSocketStatusTypes.Closed)

    if (isClosedByCaller) return

    notifyError(toClosedError(context.url, event.code))
  }

  const handleOpenTimeout = (): void => {
    notifyError(toTimeoutError(context.url))
    socket?.close()
  }

  const openSocket = (): void => {
    try {
      socket = new WebSocket(context.url)
    } catch {
      notifyError(toConnectionError(context.url))

      return
    }

    socket.onopen = handleOpen
    socket.onmessage = handleMessage
    socket.onerror = handleError
    socket.onclose = handleClose
    openTimeoutId = setTimeout(handleOpenTimeout, context.config.connectionTimeoutMs)
  }

  const send = (message: unknown): void => {
    const openConnection = socket

    if (openConnection === null || openConnection.readyState !== WEB_SOCKET_OPEN_STATE) {
      throw toSendError(context.url)
    }

    try {
      openConnection.send(JSON.stringify(message))
    } catch {
      throw toSendError(context.url)
    }
  }

  const close = (): void => {
    isClosedByCaller = true
    clearTimeout(openTimeoutId)
    clearTimeout(reconnectTimeoutId)

    if (socket === null) {
      notifyStatus(WebSocketStatusTypes.Closed)

      return
    }

    socket.close()
  }

  notifyStatus(WebSocketStatusTypes.Connecting)
  openSocket()

  return { send, close }
}

export const createNativeWebSocketAdapter = (
  config: WebSocketClientConfigModel,
): WebSocketServiceModel => ({
  connect: <TMessage,>(
    path: string,
    options: WebSocketConnectionOptionsModel<TMessage>,
  ): WebSocketConnectionModel =>
    createConnection<TMessage>({
      url: toConnectionUrl(config.baseUrl, path),
      config,
      options,
    }),
})
