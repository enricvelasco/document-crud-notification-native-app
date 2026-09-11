import { useEffect } from 'react'

import { useAppNavigation } from '@hooks/useAppNavigation'
import { useNotifications } from '@hooks/useNotifications'
import type { NotificationListItemModel } from '@ui/templates/notificationListTemplate'

import { toNotificationListItems } from './utils'

export interface UseNotificationListScreenModel {
  notifications: readonly NotificationListItemModel[]
  hasError: boolean
  handleRetry: () => void
  handleClose: () => void
}

export const useNotificationListScreen = (): UseNotificationListScreenModel => {
  const { goBack } = useAppNavigation()
  const { notifications, isError, markAsRead, startSubscription } = useNotifications()

  useEffect(() => markAsRead(), [markAsRead])

  return {
    notifications: toNotificationListItems(notifications),
    hasError: isError,
    handleRetry: startSubscription,
    handleClose: goBack,
  }
}
