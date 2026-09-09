import { Text, View } from 'react-native'

import { styles } from './styles'

export interface CardGridItemProps {
  title: string
  description: string
}

export const CardGridItem = ({ title, description }: CardGridItemProps) => (
  <View style={styles.root}>
    <Text numberOfLines={2} style={styles.title}>{title}</Text>
    <Text numberOfLines={3} style={styles.description}>{description}</Text>
  </View>
)
