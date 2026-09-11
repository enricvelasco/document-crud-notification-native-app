import {
  addNetworkStateListener,
  getNetworkStateAsync,
  type NetworkState,
  NetworkStateType,
} from 'expo-network'

import { INITIAL_NETWORK_STATE, NETWORK_LOG_LABEL, OFFLINE_NETWORK_STATE } from '../constants'
import {
  type NetworkClientConfigModel,
  type NetworkListenerType,
  type NetworkServiceModel,
  type NetworkStateModel,
  NetworkStatusTypes,
  type UnsubscribeType,
} from '../models'

type NetworkSubscriptionType = ReturnType<typeof addNetworkStateListener>

const NETWORK_STATUS_BY_TYPE: Readonly<Record<NetworkStateType, NetworkStatusTypes>> = {
  [NetworkStateType.BLUETOOTH]: NetworkStatusTypes.Bluetooth,
  [NetworkStateType.CELLULAR]: NetworkStatusTypes.Cellular,
  [NetworkStateType.ETHERNET]: NetworkStatusTypes.Ethernet,
  [NetworkStateType.NONE]: NetworkStatusTypes.None,
  [NetworkStateType.OTHER]: NetworkStatusTypes.Other,
  [NetworkStateType.UNKNOWN]: NetworkStatusTypes.Unknown,
  [NetworkStateType.VPN]: NetworkStatusTypes.Vpn,
  [NetworkStateType.WIFI]: NetworkStatusTypes.Wifi,
  [NetworkStateType.WIMAX]: NetworkStatusTypes.Wimax,
}

const toNetworkStatus = (type?: NetworkStateType): NetworkStatusTypes =>
  type === undefined ? NetworkStatusTypes.Unknown : NETWORK_STATUS_BY_TYPE[type]

const hasReachableInternet = (networkState: NetworkState): boolean =>
  networkState.isConnected === true && networkState.isInternetReachable !== false

export const networkStateToModel = (networkState: NetworkState): NetworkStateModel => ({
  isOnline: hasReachableInternet(networkState),
  status: toNetworkStatus(networkState.type),
})

const isSameNetworkState = (
  networkState: NetworkStateModel,
  otherNetworkState: NetworkStateModel,
): boolean =>
  networkState.isOnline === otherNetworkState.isOnline
  && networkState.status === otherNetworkState.status

const readNetworkState = async (): Promise<NetworkStateModel> => {
  try {
    return networkStateToModel(await getNetworkStateAsync())
  } catch {
    return OFFLINE_NETWORK_STATE
  }
}

type NetworkStateLoggerType = (networkState: NetworkStateModel) => void

const createNetworkStateLogger = (
  config: NetworkClientConfigModel,
): NetworkStateLoggerType => (networkState: NetworkStateModel): void => {
  if (!config.enableLogging) return

  console.log(NETWORK_LOG_LABEL, networkState)
}

interface NetworkStoreStateModel {
  snapshot: NetworkStateModel
  subscription: NetworkSubscriptionType | null
}

export const createExpoNetworkAdapter = (
  config: NetworkClientConfigModel,
): NetworkServiceModel => {
  const logNetworkState = createNetworkStateLogger(config)
  const listeners = new Set<NetworkListenerType>()
  const state: NetworkStoreStateModel = {
    snapshot: INITIAL_NETWORK_STATE,
    subscription: null,
  }

  const notify = (): void => {
    listeners.forEach((listener) => listener())
  }

  const applyNetworkState = (networkState: NetworkStateModel): NetworkStateModel => {
    if (isSameNetworkState(state.snapshot, networkState)) return state.snapshot

    state.snapshot = networkState
    notify()

    return networkState
  }

  const handleNetworkStateChange = (networkState: NetworkState): void => {
    const nextNetworkState = networkStateToModel(networkState)

    logNetworkState(nextNetworkState)
    applyNetworkState(nextNetworkState)
  }

  const refresh = async (): Promise<NetworkStateModel> => {
    const networkState = await readNetworkState()

    logNetworkState(networkState)

    return applyNetworkState(networkState)
  }

  const startListening = (): void => {
    if (state.subscription) return

    state.subscription = addNetworkStateListener(handleNetworkStateChange)

    void refresh()
  }

  const stopListening = (): void => {
    if (!state.subscription) return

    state.subscription.remove()
    state.subscription = null
  }

  const unsubscribe = (listener: NetworkListenerType): void => {
    listeners.delete(listener)

    if (listeners.size > 0) return

    stopListening()
  }

  return {
    getState: (): NetworkStateModel => state.snapshot,

    subscribe: (listener: NetworkListenerType): UnsubscribeType => {
      listeners.add(listener)
      startListening()

      return (): void => unsubscribe(listener)
    },

    refresh,
  }
}
