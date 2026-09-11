import { DocumentListLayoutTypes } from '../models'

const LAYOUT_VALUES: readonly string[] = Object.values(DocumentListLayoutTypes)

export const isDocumentListLayout = (value: string): value is DocumentListLayoutTypes =>
  LAYOUT_VALUES.includes(value)
