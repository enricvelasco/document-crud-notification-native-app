export const NewDocumentFormResponseTypes = {
  Success: 'success',
  Error: 'error',
} as const

export type NewDocumentFormResponseTypes =
  (typeof NewDocumentFormResponseTypes)[keyof typeof NewDocumentFormResponseTypes]
