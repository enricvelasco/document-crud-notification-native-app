import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PrimaryButton } from '@ui/atoms/PrimaryButton'

import { styles } from './styles'

export const DocumentListScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>List</Text>
        <PrimaryButton label="open bottom sheed" onPress={() => {}} />
      </View>
    </SafeAreaView>
  )
}
