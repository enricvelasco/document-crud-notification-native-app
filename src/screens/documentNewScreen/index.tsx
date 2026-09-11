import { NewDocumentFormTemplate } from '@ui/templates/newDocumentFormTemplate'

import { useDocumentNewScreen } from './resources/useDocumentNewScreen'

export const DocumentNewScreen = () => {
  const { handleSubmit, handleClose } = useDocumentNewScreen()

  return <NewDocumentFormTemplate onSubmit={handleSubmit} onClose={handleClose} />
}
