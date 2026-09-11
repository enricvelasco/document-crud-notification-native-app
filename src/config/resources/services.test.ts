import { Platform } from 'react-native'

import { withAndroidEmulatorHost } from './services'

const givenPlatform = (os: typeof Platform.OS): void => {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true })
}

describe('withAndroidEmulatorHost', () => {
  it('rewrites localhost to the Android emulator host alias on Android', () => {
    givenPlatform('android')

    expect(withAndroidEmulatorHost('http://localhost:9090')).toBe('http://10.0.2.2:9090')
    expect(withAndroidEmulatorHost('ws://localhost:9090')).toBe('ws://10.0.2.2:9090')
  })

  it('rewrites 127.0.0.1 to the Android emulator host alias on Android', () => {
    givenPlatform('android')

    expect(withAndroidEmulatorHost('http://127.0.0.1:9090')).toBe('http://10.0.2.2:9090')
  })

  it('leaves the url untouched on iOS, where the simulator shares the host network', () => {
    givenPlatform('ios')

    expect(withAndroidEmulatorHost('http://localhost:9090')).toBe('http://localhost:9090')
  })

  it('leaves non-localhost urls untouched on Android', () => {
    givenPlatform('android')

    expect(withAndroidEmulatorHost('https://api.example.com')).toBe('https://api.example.com')
  })
})
