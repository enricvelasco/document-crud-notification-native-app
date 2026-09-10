import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
  description: {
    fontSize: 13,
    lineHeight: Spacing.three,
    color: Colors.text.light,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
})
