import type { NetworkStateModel } from '@services/network'

export type NetworkListenerType = () => void

export type UnsubscribeType = () => void

export interface NetworkServiceModel {
  getState: () => NetworkStateModel
  subscribe: (listener: NetworkListenerType) => UnsubscribeType
  refresh: () => Promise<NetworkStateModel>
}
