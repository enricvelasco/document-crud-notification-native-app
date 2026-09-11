import type { TranslateType } from '@services/translate'

import { type DocumentListItemModel, DocumentListSortTypes } from './models'
import { getDocumentListSortOptions } from './resources/getDocumentListSortOptions'
import { isDocumentListSort } from './resources/isDocumentListSort'
import { sortDocumentList } from './resources/sortDocumentList'

const toDocument = (title: string): DocumentListItemModel => ({
  id: title,
  title,
  description: 'Version 1.0.0',
  contributors: [],
  attachments: [],
})

const documents: readonly DocumentListItemModel[] = [
  toDocument('Trois Pistoles'),
  toDocument('Double Bastard Ale'),
  toDocument('St. Bernardus Abt 12'),
]

const toTitles = (sorted: readonly DocumentListItemModel[]): readonly string[] =>
  sorted.map((document) => document.title)

describe('sortDocumentList', () => {
  it('puts the documents in ascending name order', () => {
    expect(toTitles(sortDocumentList(documents, DocumentListSortTypes.NameAsc))).toEqual([
      'Double Bastard Ale',
      'St. Bernardus Abt 12',
      'Trois Pistoles',
    ])
  })

  it('puts the documents in descending name order', () => {
    expect(toTitles(sortDocumentList(documents, DocumentListSortTypes.NameDesc))).toEqual([
      'Trois Pistoles',
      'St. Bernardus Abt 12',
      'Double Bastard Ale',
    ])
  })

  it('leaves the documents it was given untouched', () => {
    sortDocumentList(documents, DocumentListSortTypes.NameDesc)

    expect(toTitles(documents)).toEqual([
      'Trois Pistoles',
      'Double Bastard Ale',
      'St. Bernardus Abt 12',
    ])
  })

  it('has nothing to reorder in an empty list', () => {
    expect(sortDocumentList([], DocumentListSortTypes.NameAsc)).toEqual([])
  })
})

describe('isDocumentListSort', () => {
  it('recognises both name criteria', () => {
    expect(isDocumentListSort(DocumentListSortTypes.NameAsc)).toBe(true)
    expect(isDocumentListSort(DocumentListSortTypes.NameDesc)).toBe(true)
  })

  it('rejects a value that no longer names a criterion', () => {
    expect(isDocumentListSort('recent')).toBe(false)
  })
})

describe('getDocumentListSortOptions', () => {
  it('offers the two name criteria with their translated labels', () => {
    const translate: TranslateType = (key) => key

    expect(getDocumentListSortOptions(translate)).toEqual([
      { value: DocumentListSortTypes.NameAsc, label: '_DOCUMENT_LIST_TEMPLATE_SORT_NAME_ASC' },
      { value: DocumentListSortTypes.NameDesc, label: '_DOCUMENT_LIST_TEMPLATE_SORT_NAME_DESC' },
    ])
  })
})
