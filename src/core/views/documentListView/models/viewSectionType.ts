import type { ViewSectionStatusTypes } from './viewSectionStatusTypes'

export interface ViewSectionOkModel<TData> {
  readonly status: typeof ViewSectionStatusTypes.Ok
  readonly data: TData
}

export interface ViewSectionErrorModel {
  readonly status: typeof ViewSectionStatusTypes.Error
  readonly message: string
  readonly cause: unknown
}

export interface ViewSectionAbortedModel {
  readonly status: typeof ViewSectionStatusTypes.Aborted
}

export type ViewSectionType<TData> =
  | ViewSectionOkModel<TData>
  | ViewSectionErrorModel
  | ViewSectionAbortedModel
