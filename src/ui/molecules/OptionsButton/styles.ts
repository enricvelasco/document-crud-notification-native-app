import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const OPTIONS_BUTTON_HEIGHT = 48

export const styles = StyleSheet.create({
  root: {
    height: OPTIONS_BUTTON_HEIGHT,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
  },
  rootDisabled: {
    borderColor: Colors.border.light,
  },
})
