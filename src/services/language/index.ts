import { createExpoLocalizationLanguageAdapter } from './adapters/expoLocalizationLanguageAdapter'

export * from './constants'
export * from './models'

export const languageService = createExpoLocalizationLanguageAdapter()
