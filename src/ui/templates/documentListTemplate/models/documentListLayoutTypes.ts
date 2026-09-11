export const DocumentListLayoutTypes = {
  List: 'list',
  Grid: 'grid',
} as const

export type DocumentListLayoutTypes =
  (typeof DocumentListLayoutTypes)[keyof typeof DocumentListLayoutTypes]
