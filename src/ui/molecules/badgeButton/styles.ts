import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const BADGE_BUTTON_ICON_COLOR = Colors.text.default

export const BADGE_BUTTON_DISABLED_ICON_COLOR = Colors.border.dark

export const BADGE_BUTTON_ICON_SIZE = Spacing.four

export const BADGE_BUTTON_SIZE = 48

export const styles = StyleSheet.create({
  root: {
    width: BADGE_BUTTON_SIZE,
    height: BADGE_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
  },
  rootPressed: {
    borderColor: Colors.border.dark,
    backgroundColor: Colors.background.light,
  },
  rootDisabled: {
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.default,
  },
  badge: {
    position: 'absolute',
    top: -Spacing.half,
    right: -Spacing.half,
    pointerEvents: 'none',
  },
})
