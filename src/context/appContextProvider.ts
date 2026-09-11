import { combineComponents } from './combineComponents'
import type { ProviderComponentType } from './models'

const APP_CONTEXT_PROVIDERS: readonly ProviderComponentType[] = []

export const AppContextProvider: ProviderComponentType = combineComponents(APP_CONTEXT_PROVIDERS)
