import { useSyncExternalStore } from 'react'

import { type LanguageOptionModel, languageService, type LanguageTypes } from '@/services/language'

export interface UseLanguageModel {
  language: LanguageTypes
  availableLanguages: readonly LanguageOptionModel[]
  selectLanguage: (language: LanguageTypes) => void
}

export const useLanguage = (): UseLanguageModel => {
  const language = useSyncExternalStore(
    languageService.subscribe,
    languageService.getLanguage,
    languageService.getLanguage,
  )

  return {
    language,
    availableLanguages: languageService.getAvailableLanguages(),
    selectLanguage: languageService.setLanguage,
  }
}
