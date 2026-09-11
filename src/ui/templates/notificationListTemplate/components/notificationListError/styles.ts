import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: Colors.error.light,
  },
  message: {
    fontSize: 14,
    lineHeight: Spacing.three,
    fontWeight: '600',
    color: Colors.error.dark,
  },
})
