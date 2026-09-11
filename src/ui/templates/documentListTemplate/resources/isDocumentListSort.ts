import { DocumentListSortTypes } from '../models'

const SORT_VALUES: readonly string[] = Object.values(DocumentListSortTypes)

export const isDocumentListSort = (value: string): value is DocumentListSortTypes =>
  SORT_VALUES.includes(value)
