import type { ActionStatusTypes } from './actionStatusTypes'

export interface ActionOkModel {
  readonly status: typeof ActionStatusTypes.Ok
}

export interface ActionErrorModel {
  readonly status: typeof ActionStatusTypes.Error
  readonly message: string
  readonly cause: unknown
}

export type ActionResultType = ActionOkModel | ActionErrorModel
