import { useEffect, useRef, useState } from 'react'

import { APP_ROUTES } from '@constants/paths'
import { useAppNavigation } from '@hooks/useAppNavigation'
import { useNotifications } from '@hooks/useNotifications'
import { DocumentListSortTypes, type DocumentListStateModel, DocumentListStateTypes } from '@ui/templates/documentListTemplate'

import { loadDocumentListState, refreshDocumentListState } from './services'

const DOCUMENT_LIST_LOADING_STATE: DocumentListStateModel = {
  type: DocumentListStateTypes.Loading,
}

export interface UseDocumentListScreenModel {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  isRefreshing: boolean
  notificationCount: number
  hasNotificationError: boolean
  handleSortChange: (sort: DocumentListSortTypes) => void
  handleRefresh: () => void
  handleAddDocument: () => void
  handleOpenNotifications: () => void
}

export const useDocumentListScreen = (): UseDocumentListScreenModel => {
  const { navigateTo } = useAppNavigation()
  const { count, isError } = useNotifications()
  const [sort, setSort] = useState<DocumentListSortTypes>(DocumentListSortTypes.Title)
  const [state, setState] = useState<DocumentListStateModel>(DOCUMENT_LIST_LOADING_STATE)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    abortControllerRef.current = abortController

    void loadDocumentListState(setState, abortController.signal)

    return () => abortController.abort()
  }, [])

  const handleRefresh = () => {
    const abortController = abortControllerRef.current

    if (!abortController) return

    void refreshDocumentListState({ setState, setIsRefreshing, signal: abortController.signal })
  }

  const handleAddDocument = () => navigateTo(APP_ROUTES.documentDetail)

  const handleOpenNotifications = () => undefined

  return {
    state,
    sort,
    isRefreshing,
    notificationCount: count,
    hasNotificationError: isError,
    handleSortChange: setSort,
    handleRefresh,
    handleAddDocument,
    handleOpenNotifications,
  }
}
