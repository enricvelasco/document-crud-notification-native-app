import { Text, View } from 'react-native'

import type { NotificationListItemModel } from '../../models'
import { styles } from './styles'

export interface NotificationListCardProps {
  notification: NotificationListItemModel
}

export const NotificationListCard = ({ notification }: NotificationListCardProps) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Text numberOfLines={1} style={styles.title}>{notification.title}</Text>
      <Text numberOfLines={1} style={styles.timestamp}>{notification.timestamp}</Text>
    </View>
    <Text numberOfLines={2} style={styles.description}>{notification.description}</Text>
  </View>
)
