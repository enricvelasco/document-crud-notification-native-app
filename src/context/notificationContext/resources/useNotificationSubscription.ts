import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { NotificationContextModel, NotificationEntryModel, NotificationStreamControllerModel } from '@context'
import type { NotificationModel } from '@core/domains/notification'

import { addNotificationEntry, createNotificationStreamController, logNotification } from './services'

const INITIAL_NOTIFICATION_COUNT = 0

const INITIAL_NOTIFICATIONS: readonly NotificationEntryModel[] = []

const INITIAL_ERROR_STATE = false

const increaseCount = (count: number): number => count + 1

export const useNotificationSubscription = (): NotificationContextModel => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [count, setCount] = useState(INITIAL_NOTIFICATION_COUNT)
  const [isError, setIsError] = useState(INITIAL_ERROR_STATE)
  const controllerRef = useRef<NotificationStreamControllerModel | null>(null)

  const handleNotification = useCallback((notification: NotificationModel): void => {
    logNotification(notification)
    setNotifications((current) => addNotificationEntry(current, notification))
    setCount(increaseCount)
  }, [])

  const handleFailureLimitReached = useCallback((): void => setIsError(true), [])

  if (controllerRef.current == null) {
    controllerRef.current = createNotificationStreamController({
      onNotification: handleNotification,
      onFailureLimitReached: handleFailureLimitReached,
    })
  }

  const startStream = useCallback((): void => controllerRef.current?.start(), [])

  const startSubscription = useCallback((): void => {
    setIsError(INITIAL_ERROR_STATE)
    startStream()
  }, [startStream])

  const stopSubscription = useCallback((): void => controllerRef.current?.stop(), [])

  const markAsRead = useCallback((): void => setCount(INITIAL_NOTIFICATION_COUNT), [])

  useEffect(() => {
    startStream()

    return stopSubscription
  }, [startStream, stopSubscription])

  return {
    notifications,
    count,
    isError,
    markAsRead,
    startSubscription,
    stopSubscription,
  }
}
