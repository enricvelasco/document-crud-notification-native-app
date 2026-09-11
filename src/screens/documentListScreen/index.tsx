import { DocumentListTemplate } from '@ui/templates/documentListTemplate'

import { useDocumentListScreen } from './resources/useDocumentListScreen'

export const DocumentListScreen = () => {
  const {
    state,
    sort,
    isRefreshing,
    handleSortChange,
    handleRefresh,
    handleAddDocument,
    handleOpenNotifications,
  } = useDocumentListScreen()

  return (
    <DocumentListTemplate
      state={state}
      sort={sort}
      isRefreshing={isRefreshing}
      onSortChange={handleSortChange}
      onRefresh={handleRefresh}
      onAddDocument={handleAddDocument}
      onOpenNotifications={handleOpenNotifications}
    />
  )
}
