import type { LanguageTypes } from './languageTypes'

export interface LanguageOptionModel {
  readonly code: LanguageTypes
  readonly nativeName: string
}
