import { useBottomSheetScreen, type UseBottomSheetScreenModel } from '@hooks/useBottomSheetScreen'

const SHEET_SCREEN_RATIO = 0.5

export const useDocumentDetailScreen = (): UseBottomSheetScreenModel => {
  const { isVisible, contentHeight, handleCloseModal } = useBottomSheetScreen(SHEET_SCREEN_RATIO)

  return { isVisible, contentHeight, handleCloseModal }
}
