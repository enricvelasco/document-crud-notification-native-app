import { type DocumentListComparatorType, type DocumentListItemModel, DocumentListSortTypes } from '../models'

const compareByNameAsc: DocumentListComparatorType = (document, otherDocument) =>
  document.title.localeCompare(otherDocument.title)

const compareByNameDesc: DocumentListComparatorType = (document, otherDocument) =>
  otherDocument.title.localeCompare(document.title)

const getDocumentListComparator = (sort: DocumentListSortTypes): DocumentListComparatorType =>
  sort === DocumentListSortTypes.NameDesc ? compareByNameDesc : compareByNameAsc

export const sortDocumentList = (
  documents: readonly DocumentListItemModel[],
  sort: DocumentListSortTypes,
): readonly DocumentListItemModel[] => [...documents].sort(getDocumentListComparator(sort))
