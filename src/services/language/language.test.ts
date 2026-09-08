import { createExpoLocalizationLanguageAdapter } from './adapters/expoLocalizationLanguageAdapter'
import { LanguageTypes } from './models'

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }))

const { getLocales } = jest.requireMock('expo-localization') as { getLocales: jest.Mock }

const givenDeviceLanguages = (languageCodes: readonly (string | null)[]): void => {
  getLocales.mockReturnValue(languageCodes.map((languageCode) => ({ languageCode })))
}

beforeEach(() => {
  getLocales.mockReset()
  givenDeviceLanguages(['en'])
})

describe('createExpoLocalizationLanguageAdapter', () => {
  it('detects the device language when it is supported', () => {
    givenDeviceLanguages(['es'])

    expect(createExpoLocalizationLanguageAdapter().getLanguage()).toBe(LanguageTypes.Spanish)
  })

  it('detects catalan', () => {
    givenDeviceLanguages(['ca'])

    expect(createExpoLocalizationLanguageAdapter().getLanguage()).toBe(LanguageTypes.Catalan)
  })

  it('falls back to english when the device language is not supported', () => {
    givenDeviceLanguages(['fr'])

    expect(createExpoLocalizationLanguageAdapter().getLanguage()).toBe(LanguageTypes.English)
  })

  it('falls back to english when the device reports no language code', () => {
    givenDeviceLanguages([null])

    expect(createExpoLocalizationLanguageAdapter().getLanguage()).toBe(LanguageTypes.English)
  })

  it('takes the first supported language of the device preference list', () => {
    givenDeviceLanguages(['fr', 'ca', 'es'])

    expect(createExpoLocalizationLanguageAdapter().getLanguage()).toBe(LanguageTypes.Catalan)
  })

  it('reads the device locales only once and then keeps the resolved language', () => {
    givenDeviceLanguages(['es'])
    const languageService = createExpoLocalizationLanguageAdapter()

    languageService.getLanguage()
    languageService.getLanguage()

    expect(getLocales).toHaveBeenCalledTimes(1)
  })

  it('selects one of the supported languages', () => {
    const languageService = createExpoLocalizationLanguageAdapter()

    languageService.setLanguage(LanguageTypes.Catalan)

    expect(languageService.getLanguage()).toBe(LanguageTypes.Catalan)
  })

  it('notifies subscribers when the language changes', () => {
    const languageService = createExpoLocalizationLanguageAdapter()
    const listener = jest.fn()
    languageService.subscribe(listener)

    languageService.setLanguage(LanguageTypes.Spanish)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does not notify when the selected language is already in use', () => {
    givenDeviceLanguages(['es'])
    const languageService = createExpoLocalizationLanguageAdapter()
    const listener = jest.fn()
    languageService.subscribe(listener)

    languageService.setLanguage(LanguageTypes.Spanish)

    expect(listener).not.toHaveBeenCalled()
  })

  it('stops notifying an unsubscribed listener', () => {
    const languageService = createExpoLocalizationLanguageAdapter()
    const listener = jest.fn()
    const unsubscribe = languageService.subscribe(listener)

    unsubscribe()
    languageService.setLanguage(LanguageTypes.Spanish)

    expect(listener).not.toHaveBeenCalled()
  })

  it('keeps reporting the device language after a selection', () => {
    givenDeviceLanguages(['ca'])
    const languageService = createExpoLocalizationLanguageAdapter()

    languageService.setLanguage(LanguageTypes.Spanish)

    expect(languageService.getDeviceLanguage()).toBe(LanguageTypes.Catalan)
  })

  it('offers the three supported languages with their native name', () => {
    expect(createExpoLocalizationLanguageAdapter().getAvailableLanguages()).toEqual([
      { code: 'en', nativeName: 'English' },
      { code: 'es', nativeName: 'Español' },
      { code: 'ca', nativeName: 'Català' },
    ])
  })
})
