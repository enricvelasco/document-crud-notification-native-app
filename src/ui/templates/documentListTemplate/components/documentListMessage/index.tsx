import { Text, View } from 'react-native'

import { styles } from './styles'

export interface DocumentListMessageProps {
  message: string
}

export const DocumentListMessage = ({ message }: DocumentListMessageProps) => (
  <View style={styles.root}>
    <Text style={styles.message}>{message}</Text>
  </View>
)
