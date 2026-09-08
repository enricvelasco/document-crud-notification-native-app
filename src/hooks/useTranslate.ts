import { useSyncExternalStore } from 'react'

import { languageService } from '@/services/language'
import { translateService, type TranslateType } from '@/services/translate'

export const useTranslate = (): TranslateType => {
  useSyncExternalStore(
    languageService.subscribe,
    languageService.getLanguage,
    languageService.getLanguage,
  )

  return translateService.translate
}
