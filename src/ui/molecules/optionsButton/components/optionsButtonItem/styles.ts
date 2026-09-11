import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const OPTIONS_BUTTON_ITEM_SIZE = 48

export const OPTIONS_BUTTON_ITEM_ICON_SIZE = Spacing.four

export const styles = StyleSheet.create({
  root: {
    width: OPTIONS_BUTTON_ITEM_SIZE,
    height: OPTIONS_BUTTON_ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootDivided: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border.default,
  },
  rootDividedDisabled: {
    borderLeftColor: Colors.border.light,
  },
  rootPressed: {
    backgroundColor: Colors.background.light,
  },
  rootSelected: {
    backgroundColor: Colors.primary.light,
  },
})
