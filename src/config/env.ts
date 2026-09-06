import Constants from 'expo-constants'

import { APP_ENVS, type AppEnv, isAppEnv } from './app-env'

export interface AppConfig {
  appEnv: AppEnv
  apiUrl: string
  apiTimeoutMs: number
  enableDevTools: boolean
  sentryDsn: string
}

const DEFAULT_TIMEOUT_MS = 15000

function readAppConfig(): AppConfig {
  const raw = Constants.expoConfig?.extra?.appConfig as Partial<AppConfig> | undefined

  if (raw == null) {
    throw new Error(
      'Missing Constants.expoConfig.extra.appConfig. Restart the bundler with a ' +
        'cleared cache (expo start -c).',
    )
  }
  if (!isAppEnv(raw.appEnv)) {
    throw new Error(
      `Invalid appEnv "${String(raw.appEnv)}". Expected one of: ${APP_ENVS.join(', ')}.`,
    )
  }
  if (typeof raw.apiUrl !== 'string' || raw.apiUrl === '') {
    throw new Error('App config is missing a non-empty "apiUrl".')
  }

  return {
    appEnv: raw.appEnv,
    apiUrl: raw.apiUrl,
    apiTimeoutMs: typeof raw.apiTimeoutMs === 'number' ? raw.apiTimeoutMs : DEFAULT_TIMEOUT_MS,
    enableDevTools: raw.enableDevTools === true,
    sentryDsn: typeof raw.sentryDsn === 'string' ? raw.sentryDsn : '',
  }
}

export const appConfig: AppConfig = readAppConfig()

export const appEnv: AppEnv = appConfig.appEnv

export const isLocal = appEnv === 'local'
export const isTest = appEnv === 'test'
export const isStaging = appEnv === 'staging'
export const isProd = appEnv === 'prod'
