import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTranslate } from '@hooks/useTranslate'
import { AddIcon, BellIcon, SortIcon } from '@ui/atoms/icons'
import { PrimaryButton } from '@ui/atoms/primaryButton'
import { BadgeButton } from '@ui/molecules/badgeButton'
import { DropdownButton } from '@ui/molecules/dropdownButton'
import { OptionsButton } from '@ui/molecules/optionsButton'

import { DocumentListBody } from './components/documentListBody'
import type { DocumentListLayoutTypes, DocumentListSortTypes, DocumentListStateModel } from './models'
import { getDocumentListLayoutOptions } from './resources/getDocumentListLayoutOptions'
import { getDocumentListSortOptions } from './resources/getDocumentListSortOptions'
import { getNotificationsLabelKey } from './resources/getNotificationsLabelKey'
import { isDocumentListLayout } from './resources/isDocumentListLayout'
import { isDocumentListSort } from './resources/isDocumentListSort'
import { styles } from './styles'

export * from './models'
export { isDocumentListLayout } from './resources/isDocumentListLayout'

export interface DocumentListTemplateProps {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  layout: DocumentListLayoutTypes
  onSortChange: (sort: DocumentListSortTypes) => void
  onLayoutChange: (layout: DocumentListLayoutTypes) => void
  onAddDocument: () => void
  onOpenNotifications: () => void
  isRefreshing?: boolean
  onRefresh?: () => void
  notificationCount?: number
  hasNotificationError?: boolean
}

export const DocumentListTemplate = ({
  state,
  sort,
  layout,
  onSortChange,
  onLayoutChange,
  onAddDocument,
  onOpenNotifications,
  isRefreshing,
  onRefresh,
  notificationCount = 0,
  hasNotificationError = false,
}: DocumentListTemplateProps) => {
  const translate = useTranslate()

  const handleSortChange = (value: string): void => {
    if (!isDocumentListSort(value)) return

    onSortChange(value)
  }

  const handleLayoutChange = (value: string): void => {
    if (!isDocumentListLayout(value)) return

    onLayoutChange(value)
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.title}>{translate('_DOCUMENT_LIST_TEMPLATE_TITLE')}</Text>
        <BadgeButton
          icon={BellIcon}
          count={notificationCount}
          isError={hasNotificationError}
          accessibilityLabel={translate(getNotificationsLabelKey(hasNotificationError))}
          onPress={onOpenNotifications}
        />
      </View>

      <View style={styles.main}>
        <View style={styles.toolbar}>
          <DropdownButton
            label={translate('_DOCUMENT_LIST_TEMPLATE_SORT')}
            icon={SortIcon}
            options={getDocumentListSortOptions(translate)}
            value={sort}
            onChange={handleSortChange}
          />
          <OptionsButton
            options={getDocumentListLayoutOptions(translate)}
            value={layout}
            onChange={handleLayoutChange}
          />
        </View>

        <DocumentListBody
          state={state}
          sort={sort}
          layout={layout}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={translate('_DOCUMENT_LIST_TEMPLATE_ADD')} icon={AddIcon} onPress={onAddDocument} />
      </View>
    </SafeAreaView>
  )
}
