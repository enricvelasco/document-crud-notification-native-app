import { getLocales } from 'expo-localization'

import { LANGUAGE_OPTIONS } from '../constants'
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  type LanguageListenerType,
  type LanguageOptionModel,
  type LanguageServiceModel,
  type LanguageTypes,
  type UnsubscribeType,
} from '../models'

const toDeviceLanguageCodes = (): readonly (string | null)[] =>
  getLocales().map((locale) => locale.languageCode)

const readDeviceLanguage = (): LanguageTypes =>
  toDeviceLanguageCodes().find(isLanguage) ?? DEFAULT_LANGUAGE

export const createExpoLocalizationLanguageAdapter = (): LanguageServiceModel => {
  const listeners = new Set<LanguageListenerType>()
  let currentLanguage: LanguageTypes | null = null

  const getLanguage = (): LanguageTypes => {
    currentLanguage = currentLanguage ?? readDeviceLanguage()

    return currentLanguage
  }

  const notify = (): void => {
    listeners.forEach((listener) => listener())
  }

  return {
    getLanguage,

    setLanguage: (language: LanguageTypes): void => {
      if (language === getLanguage()) {
        return
      }

      currentLanguage = language
      notify()
    },

    getDeviceLanguage: readDeviceLanguage,

    getAvailableLanguages: (): readonly LanguageOptionModel[] => LANGUAGE_OPTIONS,

    subscribe: (listener: LanguageListenerType): UnsubscribeType => {
      listeners.add(listener)

      return (): void => {
        listeners.delete(listener)
      }
    },
  }
}
