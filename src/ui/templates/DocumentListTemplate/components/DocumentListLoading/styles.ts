import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const DOCUMENT_LIST_LOADING_COLOR = Colors.primary.default

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  label: {
    fontSize: 15,
    lineHeight: Spacing.four,
    color: Colors.text.light,
  },
})
