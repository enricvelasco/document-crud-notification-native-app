import type { DocumentListItemModel } from './documentListItemModel'

export type DocumentListComparatorType = (
  document: DocumentListItemModel,
  otherDocument: DocumentListItemModel,
) => number
