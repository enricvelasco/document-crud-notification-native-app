import { useRef, useState } from 'react'
import type { View } from 'react-native'

import type { DropdownAnchorModel } from '../models'
import { toDropdownAnchor } from './toDropdownAnchor'

export const useDropdownButton = () => {
  const anchorRef = useRef<View>(null)
  const [anchor, setAnchor] = useState<DropdownAnchorModel | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openMenu = () => {
    anchorRef.current?.measureInWindow((...bounds) => setAnchor(toDropdownAnchor(bounds)))
    setIsOpen(true)
  }

  return {
    anchorRef,
    anchor,
    isOpen,
    openMenu,
    closeMenu: () => setIsOpen(false),
  }
}
