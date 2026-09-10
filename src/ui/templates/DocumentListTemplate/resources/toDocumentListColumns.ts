import { DocumentListLayoutTypes } from '../models'

const DOCUMENT_LIST_ROW_COLUMNS = 1

const DOCUMENT_LIST_GRID_COLUMNS = 2

export const toDocumentListColumns = (layout: DocumentListLayoutTypes): number =>
  layout === DocumentListLayoutTypes.Grid ? DOCUMENT_LIST_GRID_COLUMNS : DOCUMENT_LIST_ROW_COLUMNS
