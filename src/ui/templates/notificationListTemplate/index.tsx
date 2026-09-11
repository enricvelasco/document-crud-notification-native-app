import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTranslate } from '@hooks/useTranslate'
import { IconButton } from '@ui/atoms/iconButton'
import { CloseIcon } from '@ui/atoms/icons'

import { NotificationListContent } from './components/notificationListContent'
import { NotificationListError } from './components/notificationListError'
import type { NotificationListItemModel } from './models'
import { styles } from './styles'

export * from './models'

export interface NotificationListTemplateProps {
  notifications: readonly NotificationListItemModel[]
  onRetry: () => void
  onClose: () => void
  hasError?: boolean
}

export const NotificationListTemplate = ({
  notifications,
  onRetry,
  onClose,
  hasError = false,
}: NotificationListTemplateProps) => {
  const translate = useTranslate()

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.title}>
          {translate('_NOTIFICATION_LIST_TEMPLATE_TITLE')}
        </Text>
        <IconButton
          icon={CloseIcon}
          accessibilityLabel={translate('_NOTIFICATION_LIST_TEMPLATE_CLOSE')}
          onPress={onClose}
        />
      </View>

      <View style={styles.main}>
        {hasError ? <NotificationListError onRetry={onRetry} /> : null}

        <NotificationListContent notifications={notifications} />
      </View>
    </SafeAreaView>
  )
}
