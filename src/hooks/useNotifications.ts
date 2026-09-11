import { useContext } from 'react'

import { NotificationContext, type NotificationContextModel } from '@context'

const MISSING_PROVIDER_MESSAGE =
  'useNotifications was called outside the app context provider tree.'

export type UseNotificationsModel = NotificationContextModel

export const useNotifications = (): UseNotificationsModel => {
  const notifications = useContext(NotificationContext)

  if (!notifications) throw new Error(MISSING_PROVIDER_MESSAGE)

  const { count, startSubscription, stopSubscription } = notifications

  return { count, startSubscription, stopSubscription }
}
