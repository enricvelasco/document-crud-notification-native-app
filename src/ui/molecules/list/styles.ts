import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const LIST_DEFAULT_COLUMNS = 1

export const LIST_MINIMUM_GRID_COLUMNS = 2

export const LIST_DEFAULT_GAP = Spacing.two

export const LIST_REFRESH_TINT_COLOR = Colors.primary.default

export const LIST_REFRESH_COLORS = [Colors.primary.default]

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
})
