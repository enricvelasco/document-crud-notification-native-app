import { useCallback, useState } from 'react'

import { useAppNavigation } from '@hooks/useAppNavigation'
import { useNetworkState } from '@hooks/useNetworkState'
import type { NetworkStatusTypes } from '@services/network'

import { retryNetworkConnection } from './services'

const INITIAL_RETRYING_STATE = false

export interface UseNetworkStatusGateModel {
  isOffline: boolean
  status: NetworkStatusTypes
  isRetrying: boolean
  handleRetry: () => void
}

export const useNetworkStatusGate = (): UseNetworkStatusGateModel => {
  const { isOnline, status } = useNetworkState()
  const { refreshCurrentRoute } = useAppNavigation()
  const [isRetrying, setIsRetrying] = useState(INITIAL_RETRYING_STATE)

  const stopRetrying = useCallback((): void => setIsRetrying(INITIAL_RETRYING_STATE), [])

  const handleRetry = useCallback((): void => {
    setIsRetrying(true)

    void retryNetworkConnection(refreshCurrentRoute).finally(stopRetrying)
  }, [refreshCurrentRoute, stopRetrying])

  return {
    isOffline: !isOnline,
    status,
    isRetrying,
    handleRetry,
  }
}
