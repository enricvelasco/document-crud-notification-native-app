import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const SECONDARY_BUTTON_CONTENT_COLOR = Colors.text.default

export const SECONDARY_BUTTON_DISABLED_CONTENT_COLOR = Colors.border.dark

export const SECONDARY_BUTTON_ICON_SIZE = Spacing.four

export const SECONDARY_BUTTON_HEIGHT = 48

export const styles = StyleSheet.create({
  root: {
    height: SECONDARY_BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
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
  label: {
    fontSize: 16,
    lineHeight: SECONDARY_BUTTON_ICON_SIZE,
    fontWeight: '600',
    color: SECONDARY_BUTTON_CONTENT_COLOR,
  },
  labelDisabled: {
    color: SECONDARY_BUTTON_DISABLED_CONTENT_COLOR,
  },
})
