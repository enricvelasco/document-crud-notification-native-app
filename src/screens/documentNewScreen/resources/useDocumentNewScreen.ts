import { useBottomSheetScreen } from '@hooks/useBottomSheetScreen'
import type { NewDocumentFormSubmitType } from '@ui/templates/newDocumentFormTemplate'

import { submitNewDocumentWithoutPersistence } from './services'

const SHEET_SCREEN_RATIO = 0.75

export interface UseDocumentNewScreenModel {
  isVisible: boolean
  contentHeight: number
  handleSubmit: NewDocumentFormSubmitType
  handleCloseModal: () => void
}

export const useDocumentNewScreen = (): UseDocumentNewScreenModel => {
  const { isVisible, contentHeight, handleCloseModal } = useBottomSheetScreen(SHEET_SCREEN_RATIO)

  return {
    isVisible,
    contentHeight,
    handleSubmit: submitNewDocumentWithoutPersistence,
    handleCloseModal,
  }
}
