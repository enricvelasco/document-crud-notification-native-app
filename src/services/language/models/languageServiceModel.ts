import type { LanguageOptionModel } from './languageOptionModel'
import type { LanguageTypes } from './languageTypes'

export type LanguageListenerType = () => void

export type UnsubscribeType = () => void

export interface LanguageServiceModel {
  getLanguage: () => LanguageTypes
  setLanguage: (language: LanguageTypes) => void
  getDeviceLanguage: () => LanguageTypes
  getAvailableLanguages: () => readonly LanguageOptionModel[]
  subscribe: (listener: LanguageListenerType) => UnsubscribeType
}
