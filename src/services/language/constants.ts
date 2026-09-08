import { type LanguageOptionModel, LanguageTypes } from './models'

export const LANGUAGE_OPTIONS: readonly LanguageOptionModel[] = [
  { code: LanguageTypes.English, nativeName: 'English' },
  { code: LanguageTypes.Spanish, nativeName: 'Español' },
  { code: LanguageTypes.Catalan, nativeName: 'Català' },
]
