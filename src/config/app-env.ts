export const APP_ENVS = ['local', 'test', 'staging', 'prod'] as const

export type AppEnv = (typeof APP_ENVS)[number]

export const DEFAULT_APP_ENV: AppEnv = 'local'

export const APP_ENV_VAR = 'APP_ENV'

export const isAppEnv = (value: unknown): value is AppEnv => {
  return typeof value === 'string' && (APP_ENVS as readonly string[]).includes(value)
}

export const resolveAppEnv = (raw: string | null | undefined): AppEnv => {
  if (raw == null || raw === '') {
    return DEFAULT_APP_ENV
  }
  if (!isAppEnv(raw)) {
    throw new Error(
      `Unknown ${APP_ENV_VAR} "${raw}". Expected one of: ${APP_ENVS.join(', ')}.`,
    )
  }
  return raw
}
