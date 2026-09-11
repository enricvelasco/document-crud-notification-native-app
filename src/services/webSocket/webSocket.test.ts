import { createNativeWebSocketAdapter } from './adapters/nativeWebSocketAdapter'
import { WebSocketError, WebSocketErrorTypes, WebSocketStatusTypes } from './models'

const BASE_URL = 'wss://api.example.com'
const CONNECTING_STATE = 0
const OPEN_STATE = 1
const CLOSED_STATE = 3
const NORMAL_CLOSE_CODE = 1000
const ABNORMAL_CLOSE_CODE = 1006

const CONFIG = {
  baseUrl: BASE_URL,
  connectionTimeoutMs: 5000,
  reconnectDelayMs: 1000,
  maxReconnectDelayMs: 4000,
  maxReconnectAttempts: 2,
}

interface WebSocketStubModel {
  url: string
  readyState: number
  onopen: (() => void) | null
  onmessage: ((event: { data: unknown }) => void) | null
  onerror: (() => void) | null
  onclose: ((event: { code: number }) => void) | null
  send: jest.Mock
  close: jest.Mock
}

const sockets: WebSocketStubModel[] = []

const createWebSocketStub = (url: string): WebSocketStubModel => {
  const stub: WebSocketStubModel = {
    url,
    readyState: CONNECTING_STATE,
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    send: jest.fn(),
    close: jest.fn(),
  }

  stub.close.mockImplementation(() => {
    stub.readyState = CLOSED_STATE
    stub.onclose?.({ code: NORMAL_CLOSE_CODE })
  })

  return stub
}

const webSocketMock = jest.fn((url: string) => {
  const stub = createWebSocketStub(url)
  sockets.push(stub)

  return stub
})

globalThis.WebSocket = webSocketMock as unknown as typeof globalThis.WebSocket

const lastSocket = (): WebSocketStubModel => sockets[sockets.length - 1]

const openLastSocket = (): void => {
  const socket = lastSocket()
  socket.readyState = OPEN_STATE
  socket.onopen?.()
}

const closeLastSocket = (code: number): void => {
  const socket = lastSocket()
  socket.readyState = CLOSED_STATE
  socket.onclose?.({ code })
}

const emitLastSocketMessage = (data: unknown): void => lastSocket().onmessage?.({ data })

const webSocketService = createNativeWebSocketAdapter(CONFIG)

const onMessage = jest.fn()
const onStatusChange = jest.fn()
const onError = jest.fn()

const connect = (path = '/documents') =>
  webSocketService.connect<{ id: string }>(path, { onMessage, onStatusChange, onError })

beforeEach(() => {
  jest.useFakeTimers()
  sockets.length = 0
  webSocketMock.mockClear()
  onMessage.mockReset()
  onStatusChange.mockReset()
  onError.mockReset()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('createNativeWebSocketAdapter', () => {
  it('builds the connection url from the base url and the path', () => {
    connect()

    expect(webSocketMock).toHaveBeenCalledWith('wss://api.example.com/documents')
  })

  it('does not double the slash when the base url ends with one', () => {
    const service = createNativeWebSocketAdapter({ ...CONFIG, baseUrl: `${BASE_URL}/` })

    service.connect('/documents', { onMessage })

    expect(lastSocket().url).toBe('wss://api.example.com/documents')
  })

  it('reports the connecting status before the socket opens', () => {
    connect()

    expect(onStatusChange).toHaveBeenCalledWith(WebSocketStatusTypes.Connecting)
  })

  it('reports the open status once the socket opens', () => {
    connect()
    openLastSocket()

    expect(onStatusChange).toHaveBeenLastCalledWith(WebSocketStatusTypes.Open)
  })

  it('delivers the parsed json message', () => {
    connect()
    openLastSocket()
    emitLastSocketMessage(JSON.stringify({ id: 'a' }))

    expect(onMessage).toHaveBeenCalledWith({ id: 'a' })
  })

  it('reports a parse error and delivers nothing when the message is not valid json', () => {
    connect()
    openLastSocket()
    emitLastSocketMessage('not json')

    expect(onMessage).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      type: WebSocketErrorTypes.Parse,
      code: null,
    }))
  })

  it('sends the message as json through the transport', () => {
    const connection = connect()
    openLastSocket()
    connection.send({ id: 'a' })

    expect(lastSocket().send).toHaveBeenCalledWith('{"id":"a"}')
  })

  it('fails with a send error when the connection is not open yet', () => {
    const connection = connect()

    expect(() => connection.send({ id: 'a' })).toThrow(
      expect.objectContaining({ type: WebSocketErrorTypes.Send }),
    )
  })

  it('fails with a send error when the transport rejects the message', () => {
    const connection = connect()
    openLastSocket()
    lastSocket().send.mockImplementation(() => {
      throw new Error('Transport is gone')
    })

    expect(() => connection.send({ id: 'a' })).toThrow(WebSocketError)
  })

  it('reports a connection error when the transport errors', () => {
    connect()
    lastSocket().onerror?.()

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      type: WebSocketErrorTypes.Connection,
    }))
  })

  it('reports a timeout error when the socket never opens', () => {
    connect()
    jest.advanceTimersByTime(CONFIG.connectionTimeoutMs)

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      type: WebSocketErrorTypes.Timeout,
    }))
  })

  it('does not time out once the socket is open', () => {
    connect()
    openLastSocket()
    jest.advanceTimersByTime(CONFIG.connectionTimeoutMs)

    expect(onError).not.toHaveBeenCalled()
  })

  it('reconnects after the backoff delay when the socket closes unexpectedly', () => {
    connect()
    openLastSocket()
    closeLastSocket(ABNORMAL_CLOSE_CODE)

    expect(onStatusChange).toHaveBeenLastCalledWith(WebSocketStatusTypes.Reconnecting)
    expect(webSocketMock).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)

    expect(webSocketMock).toHaveBeenCalledTimes(2)
  })

  it('grows the delay between consecutive reconnection attempts', () => {
    connect()
    closeLastSocket(ABNORMAL_CLOSE_CODE)
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)
    closeLastSocket(ABNORMAL_CLOSE_CODE)
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)

    expect(webSocketMock).toHaveBeenCalledTimes(2)

    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)

    expect(webSocketMock).toHaveBeenCalledTimes(3)
  })

  it('restarts the attempt count once a reconnection succeeds', () => {
    connect()
    closeLastSocket(ABNORMAL_CLOSE_CODE)
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)
    openLastSocket()
    closeLastSocket(ABNORMAL_CLOSE_CODE)
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)

    expect(webSocketMock).toHaveBeenCalledTimes(3)
  })

  it('gives up with a closed error once the attempts are exhausted', () => {
    connect()

    closeLastSocket(ABNORMAL_CLOSE_CODE)
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)
    closeLastSocket(ABNORMAL_CLOSE_CODE)
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs * 2)
    closeLastSocket(ABNORMAL_CLOSE_CODE)

    expect(onStatusChange).toHaveBeenLastCalledWith(WebSocketStatusTypes.Closed)
    expect(onError).toHaveBeenLastCalledWith(expect.objectContaining({
      type: WebSocketErrorTypes.Closed,
      code: ABNORMAL_CLOSE_CODE,
    }))
  })

  it('does not reconnect when the caller closes the connection', () => {
    const connection = connect()
    openLastSocket()
    connection.close()
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)

    expect(webSocketMock).toHaveBeenCalledTimes(1)
    expect(onStatusChange).toHaveBeenLastCalledWith(WebSocketStatusTypes.Closed)
    expect(onError).not.toHaveBeenCalled()
  })

  it('closes the pending reconnection when the caller closes while reconnecting', () => {
    const connection = connect()
    closeLastSocket(ABNORMAL_CLOSE_CODE)
    connection.close()
    jest.advanceTimersByTime(CONFIG.reconnectDelayMs)

    expect(webSocketMock).toHaveBeenCalledTimes(1)
    expect(onStatusChange).toHaveBeenLastCalledWith(WebSocketStatusTypes.Closed)
  })

  it('always reports our own error type, never the transport one', () => {
    connect()
    jest.advanceTimersByTime(CONFIG.connectionTimeoutMs)

    expect(onError.mock.calls[0][0]).toBeInstanceOf(WebSocketError)
  })
})
