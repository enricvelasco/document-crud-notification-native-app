import type { HttpErrorTypes } from './httpErrorTypes'

export interface HttpErrorDetailsModel {
  readonly type: HttpErrorTypes
  readonly status: number | null
}
