import { useSyncExternalStore } from 'react'

import { networkService, type NetworkStateModel } from '@services/network'

export type UseNetworkStateModel = NetworkStateModel

export const useNetworkState = (): UseNetworkStateModel => {
  const { isOnline, status } = useSyncExternalStore(
    networkService.subscribe,
    networkService.getState,
    networkService.getState,
  )

  return { isOnline, status }
}
