import type { StyleProp, ViewStyle } from 'react-native'

import { styles } from '../styles'

export const toContentStyle = (contentHeight?: number): StyleProp<ViewStyle> => {
  if (contentHeight === undefined) return styles.content

  return [styles.content, { height: contentHeight }]
}
