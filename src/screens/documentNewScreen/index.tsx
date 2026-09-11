import { BottomSheetNavigationWrapper } from '@ui/organisms/bottomSheetNavigationWrapper'
import { NewDocumentFormTemplate } from '@ui/templates/newDocumentFormTemplate'

import { useDocumentNewScreen } from './resources/useDocumentNewScreen'

export const DocumentNewScreen = () => {
  const { isVisible, contentHeight, handleSubmit, handleCloseModal } = useDocumentNewScreen()

  return (
    <BottomSheetNavigationWrapper
      isVisible={isVisible}
      contentHeight={contentHeight}
      hasContentInset={false}
      onCloseModal={handleCloseModal}
    >
      <NewDocumentFormTemplate onSubmit={handleSubmit} onClose={handleCloseModal} />
    </BottomSheetNavigationWrapper>
  )
}
