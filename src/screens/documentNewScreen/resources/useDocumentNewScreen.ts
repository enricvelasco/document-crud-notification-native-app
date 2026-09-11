import { useAppNavigation } from '@hooks/useAppNavigation'
import type { NewDocumentFormSubmitType } from '@ui/templates/newDocumentFormTemplate'

import { createNewDocumentSubmit } from './services'

export interface UseDocumentNewScreenModel {
  handleSubmit: NewDocumentFormSubmitType
  handleClose: () => void
}

export const useDocumentNewScreen = (): UseDocumentNewScreenModel => {
  const { goBack } = useAppNavigation()

  return {
    handleSubmit: createNewDocumentSubmit(goBack),
    handleClose: goBack,
  }
}
