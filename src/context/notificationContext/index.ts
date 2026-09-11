import { createContext, createElement } from 'react'

import type { ProviderComponentType } from '../models'
import type { NotificationContextModel } from './models'
import { useNotificationSubscription } from './resources/useNotificationSubscription'

export * from './models'

export const NotificationContext = createContext<NotificationContextModel | null>(null)

export const NotificationContextProvider: ProviderComponentType = ({ children }) => {
  const notifications = useNotificationSubscription()

  return createElement(NotificationContext.Provider, { value: notifications }, children)
}
