export const HttpErrorTypes = {
  Network: 'network',
  Parse: 'parse',
  Status: 'status',
  Timeout: 'timeout',
} as const

export type HttpErrorTypes = (typeof HttpErrorTypes)[keyof typeof HttpErrorTypes]
