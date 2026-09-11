import { useAppNavigation } from '@hooks/useAppNavigation'
import type { NewDocumentFormSubmitType } from '@ui/templates/newDocumentFormTemplate'

import { submitNewDocumentWithoutPersistence } from './services'

export interface UseDocumentNewScreenModel {
  handleSubmit: NewDocumentFormSubmitType
  handleClose: () => void
}

export const useDocumentNewScreen = (): UseDocumentNewScreenModel => {
  const { goBack } = useAppNavigation()

  return {
    handleSubmit: submitNewDocumentWithoutPersistence,
    handleClose: goBack,
  }
}
