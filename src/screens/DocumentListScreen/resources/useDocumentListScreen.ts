import { useState } from 'react'

import { AppRouteTypes, useAppNavigation } from '@hooks/useAppNavigation'
import { DocumentListSortTypes, type DocumentListStateModel, DocumentListStateTypes } from '@ui/templates/DocumentListTemplate'

const DOCUMENT_LIST_INITIAL_STATE: DocumentListStateModel = {
  type: DocumentListStateTypes.Content,
  documents: [],
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

  const handleAddDocument = () => navigateTo(AppRouteTypes.documentDetail)

  const handleOpenNotifications = () => undefined

  return {
    state: DOCUMENT_LIST_INITIAL_STATE,
    sort,
    handleSortChange: setSort,
    handleAddDocument,
    handleOpenNotifications,
  }
}
