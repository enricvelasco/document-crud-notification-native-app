export const ActionStatusTypes = {
  Ok: 'ok',
  Error: 'error',
} as const

export type ActionStatusTypes = (typeof ActionStatusTypes)[keyof typeof ActionStatusTypes]
