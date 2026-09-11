import { type WebSocketConnectionOptionsModel, type WebSocketError, webSocketService } from '@services/webSocket'

import { notificationPayloadToModel } from './mappers/notificationPayloadToModel'
import { notificationMock, notificationPayloadMock } from './mocks/notificationMock'
import { NotificationError, type NotificationPayloadModel } from './models'
import { subscribeToNotifications } from './repositories/subscribeToNotifications'

jest.mock('@services/webSocket', () => ({
  webSocketService: { connect: jest.fn() },
}))

const webSocketConnectMock = webSocketService.connect as jest.Mock

const closeMock = jest.fn()

const getConnectionOptions = (): WebSocketConnectionOptionsModel<NotificationPayloadModel> =>
  webSocketConnectMock.mock.calls[0][1]

const toTransportError = (message: string): WebSocketError =>
  new Error(message) as unknown as WebSocketError

beforeEach(() => {
  webSocketConnectMock.mockReset()
  closeMock.mockReset()
  webSocketConnectMock.mockReturnValue({ send: jest.fn(), close: closeMock })
})

describe('notificationPayloadToModel', () => {
  it('translates a notification payload to camelCase', () => {
    expect(notificationPayloadToModel(notificationPayloadMock)).toEqual(notificationMock)
  })

  it('keeps the timestamp as a raw string', () => {
    const notification = notificationPayloadToModel(notificationPayloadMock)

    expect(notification.timestamp).toBe('2020-08-12T07:30:08.28093+02:00')
  })
})

describe('subscribeToNotifications', () => {
  it('opens the notification stream on the notification path', () => {
    subscribeToNotifications({ onNotification: jest.fn() })

    expect(webSocketConnectMock).toHaveBeenCalledWith('/notifications', expect.any(Object))
  })

  it('hands the mapped notification to the caller', () => {
    const onNotification = jest.fn()
    subscribeToNotifications({ onNotification })

    getConnectionOptions().onMessage(notificationPayloadMock)

    expect(onNotification).toHaveBeenCalledWith(notificationMock)
  })

  it('forwards the status handler to the transport', () => {
    const onStatusChange = jest.fn()
    subscribeToNotifications({ onNotification: jest.fn(), onStatusChange })

    expect(getConnectionOptions().onStatusChange).toBe(onStatusChange)
  })

  it('reports a transport failure as a NotificationError', () => {
    const onError = jest.fn()
    subscribeToNotifications({ onNotification: jest.fn(), onError })

    getConnectionOptions().onError?.(toTransportError('The socket dropped.'))

    expect(onError).toHaveBeenCalledWith(expect.any(NotificationError))
  })

  it('keeps the transport error as the cause', () => {
    const onError = jest.fn()
    const transportError = toTransportError('The socket dropped.')
    subscribeToNotifications({ onNotification: jest.fn(), onError })

    getConnectionOptions().onError?.(transportError)

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ cause: transportError }))
  })

  it('closes the underlying connection', () => {
    subscribeToNotifications({ onNotification: jest.fn() }).close()

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('fails with a NotificationError when the stream cannot be opened', () => {
    webSocketConnectMock.mockImplementation(() => {
      throw toTransportError('The socket refused the connection.')
    })

    expect(() => subscribeToNotifications({ onNotification: jest.fn() })).toThrow(NotificationError)
  })
})
