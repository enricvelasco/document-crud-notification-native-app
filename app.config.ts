/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ConfigContext, ExpoConfig } from 'expo/config'

type EnvVars = Record<string, string>

// Keep in sync with src/config/app-env.ts (this file can't import from src/).
const APP_ENVS = ['local', 'test', 'staging', 'prod'] as const
type AppEnv = (typeof APP_ENVS)[number]

const APP_ENV_VAR = 'APP_ENV'
const DEFAULT_APP_ENV: AppEnv = 'local'
const ENV_DIR = 'env'
const BASE_ID = 'com.enricvelasco.documentcrudnotificationnativeapp'
const BASE_SCHEME = 'documentcrudnotificationnativeapp'
const BASE_NAME = 'document-crud-notification-native-app'
const DEFAULT_TIMEOUT_MS = 15000

interface AppRuntimeConfig {
  appEnv: AppEnv
  apiUrl: string
  webSocketUrl: string
  apiTimeoutMs: number
  enableDevTools: boolean
  sentryDsn: string
}

interface EnvIdentity {
  nameSuffix: string
  scheme: string
  bundleId: string
}

const resolveAppEnv = (raw: string | null | undefined): AppEnv => {
  if (raw == null || raw === '') {
    return DEFAULT_APP_ENV
  }
  if (!(APP_ENVS as readonly string[]).includes(raw)) {
    throw new Error(
      `Unknown ${APP_ENV_VAR} "${raw}". Expected one of: ${APP_ENVS.join(', ')}.`,
    )
  }
  return raw as AppEnv
}

const parseEnvFile = (contents: string): EnvVars => {
  const vars: EnvVars = {}
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) {
      continue
    }
    const body = line.startsWith('export ') ? line.slice('export '.length) : line
    const eq = body.indexOf('=')
    if (eq === -1) {
      continue
    }
    const key = body.slice(0, eq).trim()
    let value = body.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const readEnvFile = (projectRoot: string, fileName: string): EnvVars => {
  const path = join(projectRoot, ENV_DIR, fileName)
  return existsSync(path) ? parseEnvFile(readFileSync(path, 'utf8')) : {}
}

const loadEnvVars = (projectRoot: string, appEnv: AppEnv): EnvVars => {
  return {
    ...readEnvFile(projectRoot, `${appEnv}.env`),
    ...readEnvFile(projectRoot, `${appEnv}.env.local`),
  }
}

const buildRuntimeConfig = (appEnv: AppEnv, vars: EnvVars): AppRuntimeConfig => {
  const need = (key: string): string => {
    const value = vars[key]
    if (value == null || value === '') {
      throw new Error(
        `Missing "${key}" for ${APP_ENV_VAR}="${appEnv}". Set it in ` +
          `${ENV_DIR}/${appEnv}.env (or ${ENV_DIR}/${appEnv}.env.local).`,
      )
    }
    return value
  }

  const timeout = Number(vars.API_TIMEOUT_MS)

  return {
    appEnv,
    apiUrl: need('API_URL'),
    webSocketUrl: need('WEB_SOCKET_URL'),
    apiTimeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS,
    enableDevTools: (vars.ENABLE_DEV_TOOLS ?? String(appEnv !== 'prod')) === 'true',
    sentryDsn: vars.SENTRY_DSN ?? '',
  }
}

const identityFor = (appEnv: AppEnv): EnvIdentity => {
  if (appEnv === 'prod') {
    return { nameSuffix: '', scheme: BASE_SCHEME, bundleId: BASE_ID }
  }
  return {
    nameSuffix: ` (${appEnv})`,
    scheme: `${BASE_SCHEME}.${appEnv}`,
    bundleId: `${BASE_ID}.${appEnv}`,
  }
}

export default ({ config, projectRoot }: ConfigContext): ExpoConfig => {
  const appEnv = resolveAppEnv(process.env[APP_ENV_VAR])
  const vars = loadEnvVars(projectRoot, appEnv)
  const runtime = buildRuntimeConfig(appEnv, vars)
  const identity = identityFor(appEnv)

  return {
    ...config,
    name: `${config.name ?? BASE_NAME}${identity.nameSuffix}`,
    slug: config.slug ?? BASE_NAME,
    scheme: identity.scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: identity.bundleId,
    },
    android: {
      ...config.android,
      package: identity.bundleId,
    },
    extra: {
      ...config.extra,
      appConfig: runtime,
    },
  }
}
