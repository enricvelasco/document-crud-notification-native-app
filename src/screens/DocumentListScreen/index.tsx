import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PrimaryButton } from '@ui/atoms/PrimaryButton'

import { useDocumentListScreen } from './resources/useDocumentListScreen'
import { styles } from './styles'

export const DocumentListScreen = () => {
  const { handleOpenBottomSheet } = useDocumentListScreen()

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>List</Text>
        <PrimaryButton label="open bottom sheet" onPress={handleOpenBottomSheet} />
      </View>
    </SafeAreaView>
  )
}
