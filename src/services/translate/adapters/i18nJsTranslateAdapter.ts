import { I18n } from 'i18n-js'

import type { TranslationKeyType } from '@translations'

import type { TranslateConfigModel, TranslateParamsModel, TranslateServiceModel } from '../models'

export const createI18nJsTranslateAdapter = (
  config: TranslateConfigModel,
): TranslateServiceModel => {
  const i18n = new I18n(config.translations, {
    defaultLocale: config.fallbackLanguage,
    enableFallback: true,
  })

  return {
    translate: (key: TranslationKeyType, params?: TranslateParamsModel): string => {
      i18n.locale = config.getLanguage()

      return i18n.t(key, params)
    },
  }
}
