import type { LanguageTypes } from '@services/language'

import type { TranslationsModel } from './translationsModel'

export type TranslationCatalogModel = Readonly<Record<LanguageTypes, TranslationsModel>>
