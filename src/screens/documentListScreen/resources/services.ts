import { type DocumentListViewModel, loadDocumentListView, ViewSectionStatusTypes } from '@core/views/documentListView'
import type { DocumentListStateModel } from '@ui/templates/documentListTemplate'

import { toDocumentListState } from './utils'

export type SetDocumentListStateType = (state: DocumentListStateModel) => void

export type SetDocumentListRefreshingType = (isRefreshing: boolean) => void

export interface RefreshDocumentListStateModel {
  setState: SetDocumentListStateType
  setIsRefreshing: SetDocumentListRefreshingType
  signal: AbortSignal
}

export const logDocumentListError = (
  documents: DocumentListViewModel['documents'],
): void => {
  if (documents.status !== ViewSectionStatusTypes.Error) return

  console.error(documents.cause)
}

export const loadDocumentListState = async (
  setState: SetDocumentListStateType,
  signal: AbortSignal,
): Promise<void> => {
  const view = await loadDocumentListView(signal)

  logDocumentListError(view.documents)

  const nextState = toDocumentListState(view.documents)

  if (!nextState) return

  setState(nextState)
}

export const refreshDocumentListState = async ({
  setState,
  setIsRefreshing,
  signal,
}: RefreshDocumentListStateModel): Promise<void> => {
  setIsRefreshing(true)

  await loadDocumentListState(setState, signal)

  setIsRefreshing(false)
}
