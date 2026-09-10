import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const DROPDOWN_MENU_OPTION_HEIGHT = 44

export const styles = StyleSheet.create({
  root: {
    height: DROPDOWN_MENU_OPTION_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  rootPressed: {
    backgroundColor: Colors.background.light,
  },
  rootSelected: {
    backgroundColor: Colors.primary.light,
  },
  label: {
    fontSize: 16,
    color: Colors.text.default,
  },
  labelSelected: {
    fontWeight: '600',
    color: Colors.primary.dark,
  },
})
