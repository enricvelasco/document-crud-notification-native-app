import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: Spacing.four,
    fontWeight: '600',
    color: Colors.text.default,
  },
  timestamp: {
    fontSize: 13,
    lineHeight: Spacing.three,
    color: Colors.text.light,
  },
  description: {
    fontSize: 14,
    lineHeight: Spacing.three,
    color: Colors.text.light,
  },
})
