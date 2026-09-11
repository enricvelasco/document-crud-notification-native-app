import { Platform } from 'react-native'

const ANDROID_EMULATOR_HOST_ALIAS = '10.0.2.2'
const LOCALHOST_HOSTS = ['localhost', '127.0.0.1']

// The Android emulator runs in its own network namespace, so `localhost`/`127.0.0.1`
// in env files resolves to the emulator itself, not the host machine. Google
// reserves 10.0.2.2 as the alias to the host's loopback for this exact case.
// iOS simulators don't need this: they share the host's network namespace directly.
export const withAndroidEmulatorHost = (url: string): string => {
  if (Platform.OS !== 'android') {
    return url
  }
  return LOCALHOST_HOSTS.reduce(
    (result, host) => result.replace(host, ANDROID_EMULATOR_HOST_ALIAS),
    url,
  )
}
