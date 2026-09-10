import { useEffect, useState } from 'react'
import { InteractionManager, useWindowDimensions } from 'react-native'

import { useAppNavigation } from '@hooks/useAppNavigation'

const SHEET_SCREEN_RATIO = 0.5

export const useDocumentDetailScreen = () => {
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
    contentHeight: height * SHEET_SCREEN_RATIO,
    handleCloseModal: () => setIsVisible(false),
  }
}
