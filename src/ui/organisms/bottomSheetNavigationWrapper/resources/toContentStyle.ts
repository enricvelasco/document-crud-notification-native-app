import type { StyleProp, ViewStyle } from 'react-native'

export const toContentStyle = (contentHeight?: number): StyleProp<ViewStyle> => {
  if (contentHeight === undefined) return undefined

  return { height: contentHeight }
}
