import { Text, View } from 'react-native'

import { styles } from './styles'

export interface NewDocumentFormMessageProps {
  message: string
}

export const NewDocumentFormMessage = ({ message }: NewDocumentFormMessageProps) => (
  <View accessibilityRole="alert" style={styles.root}>
    <Text style={styles.message}>{message}</Text>
  </View>
)
