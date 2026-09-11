import { View } from 'react-native'

import { NetworkStatusSheet } from '@ui/organisms/networkStatusSheet'

import { useNetworkStatusGate } from './resources/useNetworkStatusGate'
import { styles } from './styles'

export const NetworkStatusGate = () => {
  const { isOffline, status, isRetrying, handleRetry } = useNetworkStatusGate()

  if (!isOffline) return null

  return (
    <View style={styles.root}>
      <NetworkStatusSheet status={status} isRetrying={isRetrying} onRetry={handleRetry} />
    </View>
  )
}
