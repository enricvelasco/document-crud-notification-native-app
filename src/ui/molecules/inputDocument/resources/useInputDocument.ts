import { documentPickerService } from '@services/documentPicker'

export const useInputDocument = (onSelectDocument: (documentName: string) => void) => {
  const selectDocument = async () => {
    const pickedDocument = await documentPickerService.pickDocument()

    if (!pickedDocument) {
      return
    }

    onSelectDocument(pickedDocument.name)
  }

  return {
    handlePress: () => {
      void selectDocument()
    },
  }
}
