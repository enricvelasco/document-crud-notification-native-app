import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { NotificationModel } from '@core/domains/notification'

import type { NotificationContextModel, NotificationStreamControllerModel } from '@context'
import { createNotificationStreamController, logNotification } from './services'

const INITIAL_NOTIFICATION_COUNT = 0

const increaseCount = (count: number): number => count + 1

export const useNotificationSubscription = (): NotificationContextModel => {
  const [count, setCount] = useState(INITIAL_NOTIFICATION_COUNT)
  const controllerRef = useRef<NotificationStreamControllerModel | null>(null)

  const handleNotification = useCallback((notification: NotificationModel): void => {
    logNotification(notification)
    setCount(increaseCount)
  }, [])

  if (controllerRef.current == null) {
    controllerRef.current = createNotificationStreamController(handleNotification)
  }

  const startSubscription = useCallback((): void => controllerRef.current?.start(), [])

  const stopSubscription = useCallback((): void => controllerRef.current?.stop(), [])

  useEffect(() => {
    startSubscription()

    return stopSubscription
  }, [startSubscription, stopSubscription])

  return { count, startSubscription, stopSubscription }
}
