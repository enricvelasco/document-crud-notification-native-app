import { combineComponents } from './combineComponents'
import type { ProviderComponentType } from './models'
import { NotificationContextProvider } from './notificationContext'

const APP_CONTEXT_PROVIDERS: readonly ProviderComponentType[] = [NotificationContextProvider]

export const AppContextProvider: ProviderComponentType = combineComponents(APP_CONTEXT_PROVIDERS)
