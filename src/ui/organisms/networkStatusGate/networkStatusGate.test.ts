import { networkService, NetworkStatusTypes } from '@services/network'

import { retryNetworkConnection } from './resources/services'

jest.mock('@services/network', () => ({
  networkService: { refresh: jest.fn() },
  NetworkStatusTypes: jest.requireActual('@services/network/models').NetworkStatusTypes,
}))

const refreshMock = networkService.refresh as jest.Mock

const onReconnectedMock = jest.fn()

const givenNetworkState = (isOnline: boolean): void => {
  refreshMock.mockResolvedValue({
    isOnline,
    status: isOnline ? NetworkStatusTypes.Wifi : NetworkStatusTypes.None,
  })
}

beforeEach(() => {
  refreshMock.mockReset()
  onReconnectedMock.mockReset()
})

describe('retryNetworkConnection', () => {
  it('reads the network state again', async () => {
    givenNetworkState(false)

    await retryNetworkConnection(onReconnectedMock)

    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it('refreshes the current route once the connection is back', async () => {
    givenNetworkState(true)

    await retryNetworkConnection(onReconnectedMock)

    expect(onReconnectedMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the notice in place while the connection is still down', async () => {
    givenNetworkState(false)

    await retryNetworkConnection(onReconnectedMock)

    expect(onReconnectedMock).not.toHaveBeenCalled()
  })
})
