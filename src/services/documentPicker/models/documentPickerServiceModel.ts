import type { PickedDocumentModel } from './pickedDocumentModel'

export interface DocumentPickerServiceModel {
  pickDocument: () => Promise<PickedDocumentModel | null>
}
