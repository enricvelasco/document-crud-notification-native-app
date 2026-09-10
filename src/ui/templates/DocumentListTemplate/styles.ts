import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: Colors.background.default,
  },
  title: {
    flexShrink: 1,
    fontSize: 28,
    lineHeight: Spacing.five,
    fontWeight: '700',
    color: Colors.text.default,
  },
  main: {
    flex: 1,
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.background.light,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  footer: {
    padding: Spacing.three,
    backgroundColor: Colors.background.default,
  },
})
