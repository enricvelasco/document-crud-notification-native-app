import { useEffect, useState } from 'react'

import { APP_ROUTES } from '@constants/paths'
import { useAppNavigation } from '@hooks/useAppNavigation'
import { DocumentListSortTypes, type DocumentListStateModel, DocumentListStateTypes } from '@ui/templates/documentListTemplate'

import { loadDocumentListState } from './services'

const DOCUMENT_LIST_LOADING_STATE: DocumentListStateModel = {
  type: DocumentListStateTypes.Loading,
}

export interface UseDocumentListScreenModel {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  handleSortChange: (sort: DocumentListSortTypes) => void
  handleAddDocument: () => void
  handleOpenNotifications: () => void
}

export const useDocumentListScreen = (): UseDocumentListScreenModel => {
  const { navigateTo } = useAppNavigation()
  const [sort, setSort] = useState<DocumentListSortTypes>(DocumentListSortTypes.Title)
  const [state, setState] = useState<DocumentListStateModel>(DOCUMENT_LIST_LOADING_STATE)

  useEffect(() => {
    const abortController = new AbortController()

    void loadDocumentListState(setState, abortController.signal)

    return () => abortController.abort()
  }, [])

  const handleAddDocument = () => navigateTo(APP_ROUTES.documentDetail)

  const handleOpenNotifications = () => undefined

  return {
    state,
    sort,
    handleSortChange: setSort,
    handleAddDocument,
    handleOpenNotifications,
  }
}
