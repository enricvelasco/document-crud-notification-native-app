import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: Spacing.four,
    fontWeight: '700',
    color: Colors.text.default,
  },
})
