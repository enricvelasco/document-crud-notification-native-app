import { DocumentListTemplate } from '@ui/templates/documentListTemplate'

import { useDocumentListScreen } from './resources/useDocumentListScreen'

export const DocumentListScreen = () => {
  const {
    state,
    sort,
    layout,
    isRefreshing,
    notificationCount,
    hasNotificationError,
    handleSortChange,
    handleLayoutChange,
    handleRefresh,
    handleAddDocument,
    handleOpenNotifications,
  } = useDocumentListScreen()

  return (
    <DocumentListTemplate
      state={state}
      sort={sort}
      layout={layout}
      isRefreshing={isRefreshing}
      notificationCount={notificationCount}
      hasNotificationError={hasNotificationError}
      onSortChange={handleSortChange}
      onLayoutChange={handleLayoutChange}
      onRefresh={handleRefresh}
      onAddDocument={handleAddDocument}
      onOpenNotifications={handleOpenNotifications}
    />
  )
}
