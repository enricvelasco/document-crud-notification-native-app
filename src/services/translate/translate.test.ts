import type { LanguageTypes } from '@services/language'
import { type TranslationCatalogModel, type TranslationKeyType, translations } from '@translations'

import { createI18nJsTranslateAdapter } from './adapters/i18nJsTranslateAdapter'

const FALLBACK_LANGUAGE: LanguageTypes = 'en'

let currentLanguage: LanguageTypes = FALLBACK_LANGUAGE

const translateService = createI18nJsTranslateAdapter({
  translations,
  getLanguage: () => currentLanguage,
  fallbackLanguage: FALLBACK_LANGUAGE,
})

beforeEach(() => {
  currentLanguage = FALLBACK_LANGUAGE
})

describe('createI18nJsTranslateAdapter', () => {
  it('translates a key in the current language', () => {
    expect(translateService.translate('_RETRY')).toBe('Retry')
  })

  it('follows the language reported by the language service', () => {
    currentLanguage = 'es'

    expect(translateService.translate('_RETRY')).toBe('Reintentar')
  })

  it('translates to catalan', () => {
    currentLanguage = 'ca'

    expect(translateService.translate('_CANCEL')).toBe('Cancel·la')
  })

  it('interpolates the params into the translation', () => {
    expect(translateService.translate('_LANGUAGE_SELECTED', { language: 'Català' })).toBe(
      'Selected language: Català',
    )
  })

  it('interpolates the params in every language', () => {
    currentLanguage = 'ca'

    expect(translateService.translate('_LANGUAGE_SELECTED', { language: 'Català' })).toBe(
      'Idioma seleccionat: Català',
    )
  })

  it('falls back to the default language when the key is missing in the current one', () => {
    const partialTranslations = {
      en: { _RETRY: 'Retry' },
      es: {},
      ca: {},
    } as unknown as TranslationCatalogModel
    const service = createI18nJsTranslateAdapter({
      translations: partialTranslations,
      getLanguage: () => 'es',
      fallbackLanguage: FALLBACK_LANGUAGE,
    })

    expect(service.translate('_RETRY')).toBe('Retry')
  })

  it('returns a visible marker for an unknown key', () => {
    expect(translateService.translate('unknown' as TranslationKeyType)).toContain('missing')
  })
})
