import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTranslate } from '@hooks/useTranslate'
import { AddIcon, BellIcon, SortIcon } from '@ui/atoms/icons'
import { PrimaryButton } from '@ui/atoms/PrimaryButton'
import { BadgeButton } from '@ui/molecules/BadgeButton'
import { DropdownButton } from '@ui/molecules/DropdownButton'
import { OptionsButton } from '@ui/molecules/OptionsButton'

import { DocumentListBody } from './components/DocumentListBody'
import { DocumentListLayoutTypes, type DocumentListSortTypes, type DocumentListStateModel } from './models'
import { getDocumentListLayoutOptions } from './resources/getDocumentListLayoutOptions'
import { getDocumentListSortOptions } from './resources/getDocumentListSortOptions'
import { isDocumentListSort } from './resources/isDocumentListSort'
import { useDocumentListTemplate } from './resources/useDocumentListTemplate'
import { styles } from './styles'

export * from './models'

export interface DocumentListTemplateProps {
  state: DocumentListStateModel
  sort: DocumentListSortTypes
  onSortChange: (sort: DocumentListSortTypes) => void
  onAddDocument: () => void
  onOpenNotifications: () => void
  notificationCount?: number
  initialLayout?: DocumentListLayoutTypes
}

export const DocumentListTemplate = ({
  state,
  sort,
  onSortChange,
  onAddDocument,
  onOpenNotifications,
  notificationCount = 0,
  initialLayout = DocumentListLayoutTypes.List,
}: DocumentListTemplateProps) => {
  const translate = useTranslate()
  const { layout, handleLayoutChange } = useDocumentListTemplate(initialLayout)

  const handleSortChange = (value: string): void => {
    if (!isDocumentListSort(value)) return

    onSortChange(value)
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.title}>{translate('_DOCUMENT_LIST_TEMPLATE_TITLE')}</Text>
        <BadgeButton
          icon={BellIcon}
          count={notificationCount}
          accessibilityLabel={translate('_DOCUMENT_LIST_TEMPLATE_NOTIFICATIONS')}
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

        <DocumentListBody state={state} layout={layout} />
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={translate('_DOCUMENT_LIST_TEMPLATE_ADD')} icon={AddIcon} onPress={onAddDocument} />
      </View>
    </SafeAreaView>
  )
}
