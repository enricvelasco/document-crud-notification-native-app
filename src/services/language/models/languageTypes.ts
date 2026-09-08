export const LanguageTypes = {
  English: 'en',
  Spanish: 'es',
  Catalan: 'ca',
} as const

export type LanguageTypes = (typeof LanguageTypes)[keyof typeof LanguageTypes]

export const SUPPORTED_LANGUAGES: readonly LanguageTypes[] = Object.values(LanguageTypes)

export const DEFAULT_LANGUAGE: LanguageTypes = LanguageTypes.English

export const isLanguage = (value: unknown): value is LanguageTypes =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
