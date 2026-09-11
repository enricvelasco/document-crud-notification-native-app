import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const DROPDOWN_BUTTON_CONTENT_COLOR = Colors.text.default

export const DROPDOWN_BUTTON_DISABLED_CONTENT_COLOR = Colors.border.dark

export const DROPDOWN_BUTTON_ICON_SIZE = Spacing.four

export const DROPDOWN_BUTTON_HEIGHT = 48

export const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  button: {
    height: DROPDOWN_BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
  },
  buttonPressed: {
    borderColor: Colors.border.dark,
    backgroundColor: Colors.background.light,
  },
  buttonDisabled: {
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.default,
  },
  labelSection: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  iconSection: {
    width: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.border.default,
  },
  dividerDisabled: {
    backgroundColor: Colors.border.light,
  },
  label: {
    fontSize: 16,
    lineHeight: DROPDOWN_BUTTON_ICON_SIZE,
    fontWeight: '600',
    color: DROPDOWN_BUTTON_CONTENT_COLOR,
  },
  labelDisabled: {
    color: DROPDOWN_BUTTON_DISABLED_CONTENT_COLOR,
  },
})
