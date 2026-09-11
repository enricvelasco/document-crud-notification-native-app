import { DocumentListTemplate } from '@ui/templates/documentListTemplate'

import { useDocumentListScreen } from './resources/useDocumentListScreen'

export const DocumentListScreen = () => {
  const {
    state,
    sort,
    handleSortChange,
    handleAddDocument,
    handleOpenNotifications,
  } = useDocumentListScreen()

  return (
    <DocumentListTemplate
      state={state}
      sort={sort}
      onSortChange={handleSortChange}
      onAddDocument={handleAddDocument}
      onOpenNotifications={handleOpenNotifications}
    />
  )
}
