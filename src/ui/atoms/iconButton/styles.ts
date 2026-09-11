import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const ICON_BUTTON_ICON_COLOR = Colors.text.default

export const ICON_BUTTON_DISABLED_ICON_COLOR = Colors.border.dark

export const ICON_BUTTON_ICON_SIZE = Spacing.four

export const ICON_BUTTON_SIZE = 40

export const styles = StyleSheet.create({
  root: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ICON_BUTTON_SIZE / 2,
    backgroundColor: Colors.background.light,
  },
  rootPressed: {
    backgroundColor: Colors.background.dark,
  },
  rootDisabled: {
    backgroundColor: Colors.background.light,
  },
})
