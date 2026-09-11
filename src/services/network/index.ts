import { appConfig } from '@config'

import { createExpoNetworkAdapter } from './adapters/expoNetworkAdapter'

export * from './constants'
export * from './models'

export const networkService = createExpoNetworkAdapter({
  enableLogging: appConfig.enableDevTools,
})
