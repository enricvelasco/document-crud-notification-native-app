import type { NetworkStatusTypes } from '@services/network'

export interface NetworkStateModel {
  readonly isOnline: boolean
  readonly status: NetworkStatusTypes
}
