import { useEffect, useState } from 'react'
import { InteractionManager, useWindowDimensions } from 'react-native'

import { useAppNavigation } from '@hooks/useAppNavigation'

export interface UseBottomSheetScreenModel {
  isVisible: boolean
  contentHeight: number
  handleCloseModal: () => void
}

export const useBottomSheetScreen = (sheetScreenRatio: number): UseBottomSheetScreenModel => {
  const { goBack } = useAppNavigation()
  const { height } = useWindowDimensions()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isVisible) return

    const dismissal = InteractionManager.runAfterInteractions(goBack)

    return () => dismissal.cancel()
  }, [isVisible, goBack])

  return {
    isVisible,
    contentHeight: height * sheetScreenRatio,
    handleCloseModal: () => setIsVisible(false),
  }
}
