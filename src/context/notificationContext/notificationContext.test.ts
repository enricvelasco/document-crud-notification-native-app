import { type NotificationError, subscribeToNotifications } from '@core/domains/notification'
import { notificationMock } from '@core/domains/notification/mocks/notificationMock'

import {
  addNotificationEntry,
  createNotificationStreamController,
  logNotification,
  logNotificationError,
  MAX_NOTIFICATION_FAILURES,
  toNotificationEntry,
} from './resources/services'

jest.mock('@core/domains/notification', () => ({
  subscribeToNotifications: jest.fn(),
}))

const subscribeToNotificationsMock = subscribeToNotifications as jest.Mock

const closeMock = jest.fn()

const onNotificationMock = jest.fn()

const onFailureLimitReachedMock = jest.fn()

const streamError = new Error('The notification stream failed.') as NotificationError

const controllerOptions = {
  onNotification: onNotificationMock,
  onFailureLimitReached: onFailureLimitReachedMock,
}

const getLastSubscriptionOptions = () =>
  subscribeToNotificationsMock.mock.calls[subscribeToNotificationsMock.mock.calls.length - 1][0]

const failStream = (times: number): void => {
  const { onError } = getLastSubscriptionOptions()

  Array.from({ length: times }).forEach(() => onError(streamError))
}

const emitNotification = (): void => getLastSubscriptionOptions().onNotification(notificationMock)

beforeEach(() => {
  subscribeToNotificationsMock.mockReset()
  closeMock.mockReset()
  onNotificationMock.mockReset()
  onFailureLimitReachedMock.mockReset()
  subscribeToNotificationsMock.mockReturnValue({ close: closeMock })
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => jest.restoreAllMocks())

describe('logNotification', () => {
  it('logs every notification it receives', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)

    logNotification(notificationMock)

    expect(consoleLogSpy).toHaveBeenCalledWith('[notification]', notificationMock)
  })
})

describe('logNotificationError', () => {
  it('logs a failing stream as an error', () => {
    logNotificationError(streamError)

    expect(console.error).toHaveBeenCalledWith('[notification]', streamError)
  })
})

describe('createNotificationStreamController', () => {
  it('opens no stream until it is started', () => {
    createNotificationStreamController(controllerOptions)

    expect(subscribeToNotificationsMock).not.toHaveBeenCalled()
  })

  it('forwards every notification to the given handler', () => {
    createNotificationStreamController(controllerOptions).start()

    emitNotification()

    expect(onNotificationMock).toHaveBeenCalledWith(notificationMock)
  })

  it('stays on a single stream when it is started twice', () => {
    const controller = createNotificationStreamController(controllerOptions)

    controller.start()
    controller.start()

    expect(subscribeToNotificationsMock).toHaveBeenCalledTimes(1)
  })

  it('closes the stream when it is stopped', () => {
    const controller = createNotificationStreamController(controllerOptions)

    controller.start()
    controller.stop()

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('closes nothing when it is stopped before being started', () => {
    createNotificationStreamController(controllerOptions).stop()

    expect(closeMock).not.toHaveBeenCalled()
  })

  it('closes the stream only once when it is stopped twice', () => {
    const controller = createNotificationStreamController(controllerOptions)

    controller.start()
    controller.stop()
    controller.stop()

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('opens a new stream when it is started again after a stop', () => {
    const controller = createNotificationStreamController(controllerOptions)

    controller.start()
    controller.stop()
    controller.start()

    expect(subscribeToNotificationsMock).toHaveBeenCalledTimes(2)
  })

  it('logs every failure it receives', () => {
    createNotificationStreamController(controllerOptions).start()

    failStream(1)

    expect(console.error).toHaveBeenCalledWith('[notification]', streamError)
  })

  it('keeps the stream open while it stays below the failure limit', () => {
    createNotificationStreamController(controllerOptions).start()

    failStream(MAX_NOTIFICATION_FAILURES - 1)

    expect(closeMock).not.toHaveBeenCalled()
    expect(onFailureLimitReachedMock).not.toHaveBeenCalled()
  })

  it('closes the stream once it reaches the failure limit', () => {
    createNotificationStreamController(controllerOptions).start()

    failStream(MAX_NOTIFICATION_FAILURES)

    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('reports the failure limit to the given handler', () => {
    createNotificationStreamController(controllerOptions).start()

    failStream(MAX_NOTIFICATION_FAILURES)

    expect(onFailureLimitReachedMock).toHaveBeenCalledTimes(1)
  })

  it('reports the failure limit only once when failures keep arriving', () => {
    createNotificationStreamController(controllerOptions).start()

    failStream(MAX_NOTIFICATION_FAILURES + 2)

    expect(onFailureLimitReachedMock).toHaveBeenCalledTimes(1)
    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('forgets earlier failures once a notification arrives', () => {
    createNotificationStreamController(controllerOptions).start()

    failStream(MAX_NOTIFICATION_FAILURES - 1)
    emitNotification()
    failStream(MAX_NOTIFICATION_FAILURES - 1)

    expect(onFailureLimitReachedMock).not.toHaveBeenCalled()
  })

  it('forgets earlier failures when it is started again', () => {
    const controller = createNotificationStreamController(controllerOptions)

    controller.start()
    failStream(MAX_NOTIFICATION_FAILURES - 1)
    controller.stop()
    controller.start()
    failStream(MAX_NOTIFICATION_FAILURES - 1)

    expect(onFailureLimitReachedMock).not.toHaveBeenCalled()
  })
})

describe('toNotificationEntry', () => {
  it('keeps every field of the notification it was given', () => {
    expect(toNotificationEntry(notificationMock, 0)).toMatchObject(notificationMock)
  })

  it('tells two notifications about the same document apart by their sequence', () => {
    const first = toNotificationEntry(notificationMock, 0)
    const second = toNotificationEntry(notificationMock, 1)

    expect(first.id).not.toBe(second.id)
  })
})

describe('addNotificationEntry', () => {
  it('puts the newest notification first', () => {
    const notifications = addNotificationEntry([], notificationMock)
    const otherNotification = { ...notificationMock, documentTitle: 'Sour Ale' }

    expect(addNotificationEntry(notifications, otherNotification)[0]).toMatchObject(otherNotification)
  })

  it('keeps the notifications it already had', () => {
    const notifications = addNotificationEntry([], notificationMock)

    expect(addNotificationEntry(notifications, notificationMock)).toHaveLength(2)
  })

  it('leaves the list it was given untouched', () => {
    const notifications = addNotificationEntry([], notificationMock)

    addNotificationEntry(notifications, notificationMock)

    expect(notifications).toHaveLength(1)
  })

  it('gives every accumulated notification its own key', () => {
    const first = addNotificationEntry([], notificationMock)
    const second = addNotificationEntry(first, notificationMock)
    const third = addNotificationEntry(second, notificationMock)

    expect(new Set(third.map((notification) => notification.id)).size).toBe(3)
  })
})
