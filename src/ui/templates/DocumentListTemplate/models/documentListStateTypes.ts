export const DocumentListStateTypes = {
  Loading: 'loading',
  Error: 'error',
  Content: 'content',
} as const

export type DocumentListStateTypes =
  (typeof DocumentListStateTypes)[keyof typeof DocumentListStateTypes]
