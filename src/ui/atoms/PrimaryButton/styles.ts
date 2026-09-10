import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const PRIMARY_BUTTON_CONTENT_COLOR = Colors.background.default

export const PRIMARY_BUTTON_DISABLED_CONTENT_COLOR = Colors.text.light

export const PRIMARY_BUTTON_ICON_SIZE = Spacing.four

export const styles = StyleSheet.create({
  root: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    backgroundColor: Colors.primary.default,
  },
  rootPressed: {
    backgroundColor: Colors.primary.dark,
  },
  rootDisabled: {
    backgroundColor: Colors.primary.light,
  },
  label: {
    fontSize: 16,
    lineHeight: PRIMARY_BUTTON_ICON_SIZE,
    fontWeight: '600',
    color: PRIMARY_BUTTON_CONTENT_COLOR,
  },
  labelDisabled: {
    color: PRIMARY_BUTTON_DISABLED_CONTENT_COLOR,
  },
})
