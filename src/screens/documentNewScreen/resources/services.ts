import { NewDocumentFormResponseTypes, type NewDocumentFormSubmitType } from '@ui/templates/newDocumentFormTemplate'

export const submitNewDocumentWithoutPersistence: NewDocumentFormSubmitType = () =>
  Promise.resolve({ type: NewDocumentFormResponseTypes.Success })
