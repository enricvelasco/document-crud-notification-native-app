import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    lineHeight: Spacing.four,
    fontWeight: '600',
    color: Colors.text.default,
  },
  labelDisabled: {
    color: Colors.text.light,
  },
})
