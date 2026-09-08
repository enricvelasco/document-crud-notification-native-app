import type { HttpErrorDetailsModel } from './httpErrorDetailsModel'
import type { HttpErrorTypes } from './httpErrorTypes'

export class HttpError extends Error implements HttpErrorDetailsModel {
  readonly type: HttpErrorTypes
  readonly status: number | null

  constructor(message: string, details: HttpErrorDetailsModel) {
    super(message)
    this.name = 'HttpError'
    this.type = details.type
    this.status = details.status
  }
}
