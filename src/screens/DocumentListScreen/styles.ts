import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.default,
  },
})
