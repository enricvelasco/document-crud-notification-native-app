import { networkService } from '@services/network'

export const retryNetworkConnection = async (onReconnected: () => void): Promise<void> => {
  const { isOnline } = await networkService.refresh()

  if (!isOnline) return

  onReconnected()
}
