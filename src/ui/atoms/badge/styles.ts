import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const BADGE_HEIGHT = 20

export const BADGE_RING_WIDTH = 2

export const styles = StyleSheet.create({
  root: {
    height: BADGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
    borderWidth: BADGE_RING_WIDTH,
    borderRadius: BADGE_HEIGHT / 2,
    borderColor: Colors.background.default,
    backgroundColor: Colors.primary.default,
  },
  rootDisabled: {
    backgroundColor: Colors.border.dark,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: Colors.background.default,
  },
})
