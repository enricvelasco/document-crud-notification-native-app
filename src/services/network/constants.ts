import { type NetworkStateModel, NetworkStatusTypes } from './models'

export const NETWORK_LOG_LABEL = '[network]'

export const INITIAL_NETWORK_STATE: NetworkStateModel = {
  isOnline: true,
  status: NetworkStatusTypes.Unknown,
}

export const OFFLINE_NETWORK_STATE: NetworkStateModel = {
  isOnline: false,
  status: NetworkStatusTypes.None,
}
