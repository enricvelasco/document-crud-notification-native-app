import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  message: {
    fontSize: 15,
    lineHeight: Spacing.four,
    textAlign: 'center',
    color: Colors.text.light,
  },
})
