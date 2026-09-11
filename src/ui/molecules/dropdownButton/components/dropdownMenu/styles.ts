import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const DROPDOWN_MENU_ANCHOR_GAP = Spacing.one

export const DROPDOWN_MENU_SCREEN_MARGIN = Spacing.three

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  menu: {
    position: 'absolute',
    overflow: 'hidden',
    paddingVertical: Spacing.one,
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
    shadowColor: Colors.text.dark,
    shadowOffset: { width: 0, height: Spacing.one },
    shadowOpacity: 0.12,
    shadowRadius: Spacing.two,
    elevation: 8,
  },
})
