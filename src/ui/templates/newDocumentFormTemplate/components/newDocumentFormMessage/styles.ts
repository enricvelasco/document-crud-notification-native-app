import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: Colors.error.light,
  },
  message: {
    fontSize: 14,
    lineHeight: Spacing.four,
    fontWeight: '600',
    color: Colors.error.dark,
  },
})
