export const NetworkStatusTypes = {
  Bluetooth: 'bluetooth',
  Cellular: 'cellular',
  Ethernet: 'ethernet',
  None: 'none',
  Other: 'other',
  Unknown: 'unknown',
  Vpn: 'vpn',
  Wifi: 'wifi',
  Wimax: 'wimax',
} as const

export type NetworkStatusTypes = (typeof NetworkStatusTypes)[keyof typeof NetworkStatusTypes]
