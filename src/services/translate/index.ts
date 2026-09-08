import { DEFAULT_LANGUAGE, languageService } from '@services/language'
import { translations } from '@translations'

import { createI18nJsTranslateAdapter } from './adapters/i18nJsTranslateAdapter'

export * from './models'

export const translateService = createI18nJsTranslateAdapter({
  translations,
  getLanguage: languageService.getLanguage,
  fallbackLanguage: DEFAULT_LANGUAGE,
})
