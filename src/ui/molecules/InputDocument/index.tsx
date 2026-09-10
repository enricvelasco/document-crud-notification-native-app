import { View } from 'react-native'

import { DocumentIcon } from '@ui/atoms/icons'
import { SecondaryButton } from '@ui/atoms/SecondaryButton'

import { useInputDocument } from './resources/useInputDocument'
import { styles } from './styles'

export interface InputDocumentProps {
  placeholder: string
  onSelectDocument: (documentName: string) => void
  value?: string
  disabled?: boolean
}

export const InputDocument = ({
  placeholder,
  onSelectDocument,
  value,
  disabled = false,
}: InputDocumentProps) => {
  const { handlePress } = useInputDocument(onSelectDocument)

  return (
    <View style={styles.root}>
      <SecondaryButton
        label={value ?? placeholder}
        icon={DocumentIcon}
        disabled={disabled}
        onPress={handlePress}
      />
    </View>
  )
}
