import { NetworkStatusTypes } from '@services/network'
import type { TranslationKeyType } from '@translations'

const NETWORK_STATUS_LABEL_KEYS: Readonly<Record<NetworkStatusTypes, TranslationKeyType>> = {
  [NetworkStatusTypes.Bluetooth]: '_NETWORK_STATUS_BLUETOOTH',
  [NetworkStatusTypes.Cellular]: '_NETWORK_STATUS_CELLULAR',
  [NetworkStatusTypes.Ethernet]: '_NETWORK_STATUS_ETHERNET',
  [NetworkStatusTypes.None]: '_NETWORK_STATUS_NONE',
  [NetworkStatusTypes.Other]: '_NETWORK_STATUS_OTHER',
  [NetworkStatusTypes.Unknown]: '_NETWORK_STATUS_UNKNOWN',
  [NetworkStatusTypes.Vpn]: '_NETWORK_STATUS_VPN',
  [NetworkStatusTypes.Wifi]: '_NETWORK_STATUS_WIFI',
  [NetworkStatusTypes.Wimax]: '_NETWORK_STATUS_WIMAX',
}

export const toNetworkStatusLabelKey = (status: NetworkStatusTypes): TranslationKeyType =>
  NETWORK_STATUS_LABEL_KEYS[status]

export const toRetryLabelKey = (isRetrying: boolean): TranslationKeyType =>
  isRetrying ? '_NETWORK_STATUS_SHEET_RETRYING' : '_NETWORK_STATUS_SHEET_RETRY'
