import { StyleSheet } from 'react-native'

import { Colors, Spacing } from '@constants/theme'

export const CARD_LIST_ITEM_COLUMN_ICON_SIZE = Spacing.three

export const CARD_LIST_ITEM_COLUMN_ICON_COLOR = Colors.text.light

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: Spacing.three,
    fontWeight: '600',
    color: Colors.text.light,
  },
  items: {
    gap: Spacing.one,
  },
  item: {
    fontSize: 14,
    lineHeight: Spacing.four,
    color: Colors.text.default,
  },
})
