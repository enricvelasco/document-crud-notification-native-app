import { documentPickerService, type PickedDocumentModel } from '@services/documentPicker'

export const useInputDocument = (
  onSelectDocument: (document: PickedDocumentModel) => void,
) => {
  const selectDocument = async () => {
    const pickedDocument = await documentPickerService.pickDocument()

    if (!pickedDocument) {
      return
    }

    onSelectDocument(pickedDocument)
  }

  return {
    handlePress: () => {
      void selectDocument()
    },
  }
}
