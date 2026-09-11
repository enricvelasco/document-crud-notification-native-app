import { Text, View } from 'react-native'

import { styles } from './styles'

export interface NotificationListMessageProps {
  message: string
}

export const NotificationListMessage = ({ message }: NotificationListMessageProps) => (
  <View style={styles.root}>
    <Text style={styles.message}>{message}</Text>
  </View>
)
