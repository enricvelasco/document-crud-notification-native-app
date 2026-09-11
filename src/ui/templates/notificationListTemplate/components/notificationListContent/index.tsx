import { useTranslate } from '@hooks/useTranslate'
import { List } from '@ui/molecules/list'

import type { NotificationListItemModel } from '../../models'
import { NotificationListCard } from '../notificationListCard'
import { NotificationListMessage } from '../notificationListMessage'

export interface NotificationListContentProps {
  notifications: readonly NotificationListItemModel[]
}

export const NotificationListContent = ({ notifications }: NotificationListContentProps) => {
  const translate = useTranslate()

  return (
    <List
      items={notifications}
      keyExtractor={(notification) => notification.id}
      renderItem={(notification) => <NotificationListCard notification={notification} />}
      empty={<NotificationListMessage message={translate('_NOTIFICATION_LIST_TEMPLATE_EMPTY')} />}
    />
  )
}
