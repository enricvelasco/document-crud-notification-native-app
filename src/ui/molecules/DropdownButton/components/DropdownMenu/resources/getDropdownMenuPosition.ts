import type { DropdownAnchorModel } from '../../../models'
import { DROPDOWN_MENU_ANCHOR_GAP, DROPDOWN_MENU_SCREEN_MARGIN } from '../styles'

type MenuWindowType = { width: number, height: number }

const getUnanchoredMenuPosition = (window: MenuWindowType) => ({
  top: DROPDOWN_MENU_SCREEN_MARGIN,
  left: DROPDOWN_MENU_SCREEN_MARGIN,
  minWidth: 0,
  maxWidth: window.width - DROPDOWN_MENU_SCREEN_MARGIN * 2,
  maxHeight: window.height - DROPDOWN_MENU_SCREEN_MARGIN * 2,
})

export const getDropdownMenuPosition = (anchor: DropdownAnchorModel | null, window: MenuWindowType) => {
  if (!anchor) return getUnanchoredMenuPosition(window)

  const top = anchor.y + anchor.height + DROPDOWN_MENU_ANCHOR_GAP

  return {
    top,
    left: anchor.x,
    minWidth: anchor.width,
    maxWidth: window.width - anchor.x - DROPDOWN_MENU_SCREEN_MARGIN,
    maxHeight: window.height - top - DROPDOWN_MENU_SCREEN_MARGIN,
  }
}
