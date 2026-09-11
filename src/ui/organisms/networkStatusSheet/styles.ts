import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const NETWORK_STATUS_SHEET_ICON_SIZE = Spacing.six

export const NETWORK_STATUS_SHEET_ICON_COLOR = Colors.error.default

export const SHEET_SAFE_AREA_EDGES = ['bottom'] as const

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 24,
    lineHeight: Spacing.five,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.text.default,
  },
  message: {
    fontSize: 16,
    lineHeight: Spacing.four,
    textAlign: 'center',
    color: Colors.text.light,
  },
  status: {
    fontSize: 14,
    lineHeight: Spacing.three,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    color: Colors.error.dark,
    backgroundColor: Colors.error.light,
  },
  actions: {
    alignSelf: 'stretch',
    paddingTop: Spacing.two,
  },
})
