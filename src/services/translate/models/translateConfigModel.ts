import type { LanguageTypes } from '@/services/language'
import type { TranslationCatalogModel } from '@/translations'

export interface TranslateConfigModel {
  translations: TranslationCatalogModel
  getLanguage: () => LanguageTypes
  fallbackLanguage: LanguageTypes
}
