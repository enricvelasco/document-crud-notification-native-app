import ca from './ca.json'
import en from './en.json'
import es from './es.json'
import type { TranslationCatalogModel } from './models'

export * from './models'

export const translations: TranslationCatalogModel = { en, es, ca }
