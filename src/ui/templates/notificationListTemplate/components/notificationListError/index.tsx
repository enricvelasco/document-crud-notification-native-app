import { Text, View } from 'react-native'

import { useTranslate } from '@hooks/useTranslate'
import { SecondaryButton } from '@ui/atoms/secondaryButton'

import { styles } from './styles'

export interface NotificationListErrorProps {
  onRetry: () => void
}

export const NotificationListError = ({ onRetry }: NotificationListErrorProps) => {
  const translate = useTranslate()

  return (
    <View accessibilityRole="alert" style={styles.root}>
      <Text style={styles.message}>{translate('_NOTIFICATION_LIST_TEMPLATE_ERROR')}</Text>
      <SecondaryButton
        label={translate('_NOTIFICATION_LIST_TEMPLATE_RECONNECT')}
        onPress={onRetry}
      />
    </View>
  )
}
