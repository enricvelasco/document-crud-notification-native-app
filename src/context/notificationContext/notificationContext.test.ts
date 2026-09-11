import { type NotificationError, subscribeToNotifications } from '@core/domains/notification'
import { notificationMock } from '@core/domains/notification/mocks/notificationMock'

import { createNotificationStreamController, logNotification, logNotificationError } from './resources/services'

jest.mock('@core/domains/notification', () => ({
  subscribeToNotifications: jest.fn(),
}))

const subscribeToNotificationsMock = subscribeToNotifications as jest.Mock

const closeMock = jest.fn()

const onNotificationMock = jest.fn()

beforeEach(() => {
  subscribeToNotificationsMock.mockReset()
  closeMock.mockReset()
  onNotificationMock.mockReset()
  subscribeToNotificationsMock.mockReturnValue({ close: closeMock })
})

describe('logNotification', () => {
  it('logs every notification it receives', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)

    logNotification(notificationMock)

    expect(consoleLogSpy).toHaveBeenCalledWith('[notification]', notificationMock)

    consoleLogSpy.mockRestore()
  })
})

describe('logNotificationError', () => {
  it('logs a failing stream as an error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const error = new Error('The notification stream failed.') as NotificationError

    logNotificationError(error)

    expect(consoleErrorSpy).toHaveBeenCalledWith('[notification]', error)

    consoleErrorSpy.mockRestore()
  })
})

describe('createNotificationStreamController', () => {
  it('opens no stream until it is started', () => {
    createNotificationStreamController(onNotificationMock)

    expect(subscribeToNotificationsMock).not.toHaveBeenCalled()
  })

  it('subscribes with the given handler and the error logger', () => {
    createNotificationStreamController(onNotificationMock).start()

    expect(subscribeToNotificationsMock).toHaveBeenCalledWith({
      onNotification: onNotificationMock,
      onError: logNotificationError,
    })
  })

  it('stays on a single stream when it is started twice', () => {
    const controller = createNotificationStreamController(onNotificationMock)

    controller.start()
    controller.start()

    expect(subscribeToNotificationsMock).toHaveBeenCalledTimes(1)
  })

  it('closes the stream when it is stopped', () => {
    const controller = createNotificationStreamController(onNotificationMock)

    controller.start()
    controller.stop()

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('closes nothing when it is stopped before being started', () => {
    createNotificationStreamController(onNotificationMock).stop()

    expect(closeMock).not.toHaveBeenCalled()
  })

  it('closes the stream only once when it is stopped twice', () => {
    const controller = createNotificationStreamController(onNotificationMock)

    controller.start()
    controller.stop()
    controller.stop()

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('opens a new stream when it is started again after a stop', () => {
    const controller = createNotificationStreamController(onNotificationMock)

    controller.start()
    controller.stop()
    controller.start()

    expect(subscribeToNotificationsMock).toHaveBeenCalledTimes(2)
  })
})
