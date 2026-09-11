import type { DocumentListItemViewModel } from './documentListItemViewModel'
import type { ViewSectionType } from './viewSectionType'

export interface DocumentListViewModel {
  readonly documents: ViewSectionType<readonly DocumentListItemViewModel[]>
}
