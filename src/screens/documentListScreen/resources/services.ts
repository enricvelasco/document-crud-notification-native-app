import { type DocumentListViewModel, loadDocumentListView, ViewSectionStatusTypes } from '@core/views/documentListView'
import { storageService } from '@services/storage'
import type { DocumentListLayoutTypes, DocumentListStateModel } from '@ui/templates/documentListTemplate'

import { DOCUMENT_LIST_LAYOUT_STORAGE_KEY } from './constants'
import { toDocumentListLayout, toDocumentListState } from './utils'

export type SetDocumentListStateType = (state: DocumentListStateModel) => void

export type SetDocumentListRefreshingType = (isRefreshing: boolean) => void

export type SetDocumentListLayoutType = (layout: DocumentListLayoutTypes) => void

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

export const readDocumentListLayout = async (): Promise<DocumentListLayoutTypes | null> => {
  try {
    return toDocumentListLayout(await storageService.getItem<string>(DOCUMENT_LIST_LAYOUT_STORAGE_KEY))
  } catch (error) {
    console.error(error)

    return null
  }
}

export const saveDocumentListLayout = async (layout: DocumentListLayoutTypes): Promise<void> => {
  try {
    await storageService.setItem(DOCUMENT_LIST_LAYOUT_STORAGE_KEY, layout)
  } catch (error) {
    console.error(error)
  }
}

export const restoreDocumentListLayout = async (
  setLayout: SetDocumentListLayoutType,
): Promise<void> => {
  const storedLayout = await readDocumentListLayout()

  if (!storedLayout) return

  setLayout(storedLayout)
}
