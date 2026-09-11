import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const INPUT_TEXT_PLACEHOLDER_COLOR = Colors.text.light

export const INPUT_TEXT_DISABLED_PLACEHOLDER_COLOR = Colors.border.dark

export const styles = StyleSheet.create({
  root: {
    height: 48,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.default,
    fontSize: 16,
    color: Colors.text.default,
  },
  rootMultiline: {
    height: 112,
    paddingVertical: Spacing.two,
    textAlignVertical: 'top',
  },
  rootFocused: {
    borderColor: Colors.primary.default,
  },
  rootDisabled: {
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.light,
    color: Colors.text.light,
  },
})
