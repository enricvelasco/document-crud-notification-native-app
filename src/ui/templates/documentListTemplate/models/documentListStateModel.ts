import type { DocumentListItemModel } from './documentListItemModel'
import type { DocumentListStateTypes } from './documentListStateTypes'

export interface DocumentListLoadingStateModel {
  readonly type: typeof DocumentListStateTypes.Loading
}

export interface DocumentListErrorStateModel {
  readonly type: typeof DocumentListStateTypes.Error
  readonly message: string
}

export interface DocumentListContentStateModel {
  readonly type: typeof DocumentListStateTypes.Content
  readonly documents: readonly DocumentListItemModel[]
}

export type DocumentListStateModel =
  | DocumentListLoadingStateModel
  | DocumentListErrorStateModel
  | DocumentListContentStateModel
