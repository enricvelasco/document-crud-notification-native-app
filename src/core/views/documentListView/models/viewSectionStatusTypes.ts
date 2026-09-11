export const ViewSectionStatusTypes = {
  Ok: 'ok',
  Error: 'error',
  Aborted: 'aborted',
} as const

export type ViewSectionStatusTypes =
  (typeof ViewSectionStatusTypes)[keyof typeof ViewSectionStatusTypes]
