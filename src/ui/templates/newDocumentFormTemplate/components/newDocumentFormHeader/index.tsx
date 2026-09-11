import { Text, View } from 'react-native'

import { IconButton } from '@ui/atoms/iconButton'
import { CloseIcon } from '@ui/atoms/icons'

import { styles } from './styles'

export interface NewDocumentFormHeaderProps {
  title: string
  closeLabel: string
  onClose: () => void
}

export const NewDocumentFormHeader = ({ title, closeLabel, onClose }: NewDocumentFormHeaderProps) => (
  <View style={styles.root}>
    <Text numberOfLines={1} style={styles.title}>{title}</Text>
    <IconButton icon={CloseIcon} accessibilityLabel={closeLabel} onPress={onClose} />
  </View>
)
