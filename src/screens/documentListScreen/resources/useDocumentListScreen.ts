import { useEffect, useRef, useState } from 'react'

import { APP_ROUTES } from '@constants/paths'
import { useAppNavigation } from '@hooks/useAppNavigation'
import { useNotifications } from '@hooks/useNotifications'
import {
  DocumentListLayoutTypes,
  DocumentListSortTypes,
  type DocumentListStateModel,
  DocumentListStateTypes,
} from '@ui/templates/documentListTemplate'

import {
  loadDocumentListState,
  refreshDocumentListState,
  restoreDocumentListLayout,
  saveDocumentListLayout,
} from './services'

const DOCUMENT_LIST_LOADING_STATE: DocumentListStateModel = {
  type: DocumentListStateTypes.Loading,
}

export interface UseDocumentListScreenModel {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  layout: DocumentListLayoutTypes
  isRefreshing: boolean
  notificationCount: number
  hasNotificationError: boolean
  handleSortChange: (sort: DocumentListSortTypes) => void
  handleLayoutChange: (layout: DocumentListLayoutTypes) => void
  handleRefresh: () => void
  handleAddDocument: () => void
  handleOpenNotifications: () => void
}

export const useDocumentListScreen = (): UseDocumentListScreenModel => {
  const { navigateTo } = useAppNavigation()
  const { count, isError } = useNotifications()
  const [sort, setSort] = useState<DocumentListSortTypes>(DocumentListSortTypes.NameAsc)
  const [layout, setLayout] = useState<DocumentListLayoutTypes>(DocumentListLayoutTypes.List)
  const [state, setState] = useState<DocumentListStateModel>(DOCUMENT_LIST_LOADING_STATE)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    abortControllerRef.current = abortController

    void loadDocumentListState(setState, abortController.signal)

    return () => abortController.abort()
  }, [])

  useEffect(() => {
    void restoreDocumentListLayout(setLayout)
  }, [])

  const handleLayoutChange = (nextLayout: DocumentListLayoutTypes) => {
    setLayout(nextLayout)

    void saveDocumentListLayout(nextLayout)
  }

  const handleRefresh = () => {
    const abortController = abortControllerRef.current

    if (!abortController) return

    void refreshDocumentListState({ setState, setIsRefreshing, signal: abortController.signal })
  }

  const handleAddDocument = () => navigateTo(APP_ROUTES.documentNew)

  const handleOpenNotifications = () => undefined

  return {
    state,
    sort,
    layout,
    isRefreshing,
    notificationCount: count,
    hasNotificationError: isError,
    handleSortChange: setSort,
    handleLayoutChange,
    handleRefresh,
    handleAddDocument,
    handleOpenNotifications,
  }
}
