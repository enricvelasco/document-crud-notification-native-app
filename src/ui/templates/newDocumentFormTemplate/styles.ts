import { Platform, StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

const FOOTER_BOTTOM_PADDING = Platform.select({ android: Spacing.five, default: Spacing.three })

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  title: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    lineHeight: Spacing.four,
    fontWeight: '700',
    color: Colors.text.default,
  },
  content: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingBottom: FOOTER_BOTTOM_PADDING,
    paddingHorizontal: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.default,
  },
})
