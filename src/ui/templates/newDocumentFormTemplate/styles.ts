import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  title: {
    fontSize: 22,
    lineHeight: Spacing.five,
    fontWeight: '700',
    color: Colors.text.default,
  },
  footer: {
    padding: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.default,
  },
})
