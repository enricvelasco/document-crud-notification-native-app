import { ActivityIndicator, Text, View } from 'react-native'

import { useTranslate } from '@hooks/useTranslate'

import { DOCUMENT_LIST_LOADING_COLOR, styles } from './styles'

export const DocumentListLoading = () => {
  const translate = useTranslate()

  return (
    <View accessibilityRole="progressbar" style={styles.root}>
      <ActivityIndicator color={DOCUMENT_LIST_LOADING_COLOR} />
      <Text style={styles.label}>{translate('_LOADING')}</Text>
    </View>
  )
}
