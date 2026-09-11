import { Colors } from '@constants/theme'

export const OPTIONS_BUTTON_ITEM_ICON_COLOR = Colors.text.default

export const OPTIONS_BUTTON_ITEM_SELECTED_ICON_COLOR = Colors.primary.default

export const OPTIONS_BUTTON_ITEM_DISABLED_ICON_COLOR = Colors.border.dark

export const getOptionsButtonItemIconColor = ({ selected, disabled }: { selected: boolean, disabled: boolean }) => {
  if (disabled) return OPTIONS_BUTTON_ITEM_DISABLED_ICON_COLOR

  if (selected) return OPTIONS_BUTTON_ITEM_SELECTED_ICON_COLOR

  return OPTIONS_BUTTON_ITEM_ICON_COLOR
}
