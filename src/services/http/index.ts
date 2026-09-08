import { appConfig } from '@config'

import { createFetchHttpAdapter } from './adapters/fetchHttpAdapter'

export * from './models'

export const httpService = createFetchHttpAdapter({
  baseUrl: appConfig.apiUrl,
  timeoutMs: appConfig.apiTimeoutMs,
})
