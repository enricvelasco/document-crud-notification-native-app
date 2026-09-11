export const DocumentListSortTypes = {
  NameAsc: 'nameAsc',
  NameDesc: 'nameDesc',
} as const

export type DocumentListSortTypes =
  (typeof DocumentListSortTypes)[keyof typeof DocumentListSortTypes]
