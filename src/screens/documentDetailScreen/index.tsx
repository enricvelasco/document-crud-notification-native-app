import { Text, View } from 'react-native'

import { BottomSheetNavigationWrapper } from '@ui/organisms/BottomSheetNavigationWrapper'

import { useDocumentDetailScreen } from './resources/useDocumentDetailScreen'
import { styles } from './styles'

export const DocumentDetailScreen = () => {
  const { isVisible, contentHeight, handleCloseModal } = useDocumentDetailScreen()

  return (
    <BottomSheetNavigationWrapper
      isVisible={isVisible}
      contentHeight={contentHeight}
      onCloseModal={handleCloseModal}
    >
      <View style={styles.root}>
        <Text style={styles.title}>detalle</Text>
      </View>
    </BottomSheetNavigationWrapper>
  )
}
