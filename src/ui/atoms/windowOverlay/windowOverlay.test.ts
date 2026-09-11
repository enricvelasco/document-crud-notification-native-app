import { Platform } from 'react-native'

import { hasWindowLevelOverlay } from './resources/services'

const givenPlatform = (os: typeof Platform.OS): void => {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true })
}

describe('hasWindowLevelOverlay', () => {
  it('lifts the overlay to window level on iOS, where a form sheet is a native modal', () => {
    givenPlatform('ios')

    expect(hasWindowLevelOverlay()).toBe(true)
  })

  it('keeps the overlay in the view tree on Android, where a form sheet shares the window', () => {
    givenPlatform('android')

    expect(hasWindowLevelOverlay()).toBe(false)
  })

  it('keeps the overlay in the view tree on web', () => {
    givenPlatform('web')

    expect(hasWindowLevelOverlay()).toBe(false)
  })
})
