import { NetworkStatusTypes } from '@services/network'

import { toNetworkStatusLabelKey, toRetryLabelKey } from './resources/services'

jest.mock('@config', () => ({ appConfig: { enableDevTools: false } }))

describe('toNetworkStatusLabelKey', () => {
  it('labels every network status the platform can report', () => {
    const labelKeys = Object.values(NetworkStatusTypes).map(toNetworkStatusLabelKey)

    expect(labelKeys).toHaveLength(Object.values(NetworkStatusTypes).length)
    expect(labelKeys.every(Boolean)).toBe(true)
  })

  it('labels a missing connection', () => {
    expect(toNetworkStatusLabelKey(NetworkStatusTypes.None)).toBe('_NETWORK_STATUS_NONE')
  })

  it('labels mobile data', () => {
    expect(toNetworkStatusLabelKey(NetworkStatusTypes.Cellular)).toBe('_NETWORK_STATUS_CELLULAR')
  })
})

describe('toRetryLabelKey', () => {
  it('invites the user to retry while the button is idle', () => {
    expect(toRetryLabelKey(false)).toBe('_NETWORK_STATUS_SHEET_RETRY')
  })

  it('reports the check in progress while retrying', () => {
    expect(toRetryLabelKey(true)).toBe('_NETWORK_STATUS_SHEET_RETRYING')
  })
})
