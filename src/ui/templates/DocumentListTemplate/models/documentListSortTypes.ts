export const DocumentListSortTypes = {
  Title: 'title',
  Recent: 'recent',
} as const

export type DocumentListSortTypes =
  (typeof DocumentListSortTypes)[keyof typeof DocumentListSortTypes]
