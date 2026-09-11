import { NotificationListTemplate } from '@ui/templates/notificationListTemplate'

import { useNotificationListScreen } from './resources/useNotificationListScreen'

export const NotificationListScreen = () => {
  const {
    notifications,
    hasError,
    handleRetry,
    handleClose,
  } = useNotificationListScreen()

  return (
    <NotificationListTemplate
      notifications={notifications}
      hasError={hasError}
      onRetry={handleRetry}
      onClose={handleClose}
    />
  )
}
