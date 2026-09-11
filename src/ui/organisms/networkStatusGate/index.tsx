import { WindowOverlay } from '@ui/atoms/windowOverlay'
import { NetworkStatusSheet } from '@ui/organisms/networkStatusSheet'

import { useNetworkStatusGate } from './resources/useNetworkStatusGate'

export const NetworkStatusGate = () => {
  const { isOffline, status, isRetrying, handleRetry } = useNetworkStatusGate()

  if (!isOffline) return null

  return (
    <WindowOverlay>
      <NetworkStatusSheet status={status} isRetrying={isRetrying} onRetry={handleRetry} />
    </WindowOverlay>
  )
}
