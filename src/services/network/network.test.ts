import { NetworkStateType } from 'expo-network'

import { createExpoNetworkAdapter, networkStateToModel } from './adapters/expoNetworkAdapter'
import { NetworkStatusTypes } from './models'

jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn(),
  getNetworkStateAsync: jest.fn(),
  NetworkStateType: {
    BLUETOOTH: 'BLUETOOTH',
    CELLULAR: 'CELLULAR',
    ETHERNET: 'ETHERNET',
    NONE: 'NONE',
    OTHER: 'OTHER',
    UNKNOWN: 'UNKNOWN',
    VPN: 'VPN',
    WIFI: 'WIFI',
    WIMAX: 'WIMAX',
  },
}))

const { addNetworkStateListener, getNetworkStateAsync } = jest.requireMock('expo-network') as {
  addNetworkStateListener: jest.Mock
  getNetworkStateAsync: jest.Mock
}

const adapterConfig = { enableLogging: false }

const removeMock = jest.fn()

const onlineWifiState = {
  type: NetworkStateType.WIFI,
  isConnected: true,
  isInternetReachable: true,
}

const offlineState = {
  type: NetworkStateType.NONE,
  isConnected: false,
  isInternetReachable: false,
}

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => {
    setImmediate(resolve)
  })

const emitNetworkState = (networkState: unknown): void =>
  addNetworkStateListener.mock.calls[addNetworkStateListener.mock.calls.length - 1][0](networkState)

beforeEach(() => {
  addNetworkStateListener.mockReset()
  getNetworkStateAsync.mockReset()
  removeMock.mockReset()
  addNetworkStateListener.mockReturnValue({ remove: removeMock })
  getNetworkStateAsync.mockResolvedValue(onlineWifiState)
})

afterEach(() => jest.restoreAllMocks())

describe('networkStateToModel', () => {
  it('reports an online device when the connection reaches the internet', () => {
    expect(networkStateToModel(onlineWifiState)).toEqual({
      isOnline: true,
      status: NetworkStatusTypes.Wifi,
    })
  })

  it('reports an offline device when there is no connection', () => {
    expect(networkStateToModel(offlineState)).toEqual({
      isOnline: false,
      status: NetworkStatusTypes.None,
    })
  })

  it('reports an offline device when the connection does not reach the internet', () => {
    const captivePortalState = {
      type: NetworkStateType.WIFI,
      isConnected: true,
      isInternetReachable: false,
    }

    expect(networkStateToModel(captivePortalState).isOnline).toBe(false)
  })

  it('stays online while the internet reachability is still unknown', () => {
    const pendingState = { type: NetworkStateType.CELLULAR, isConnected: true }

    expect(networkStateToModel(pendingState)).toEqual({
      isOnline: true,
      status: NetworkStatusTypes.Cellular,
    })
  })

  it('falls back to an unknown status when the platform reports no connection type', () => {
    expect(networkStateToModel({ isConnected: true }).status).toBe(NetworkStatusTypes.Unknown)
  })
})

describe('createExpoNetworkAdapter', () => {
  it('starts online so the app does not flash an offline notice before the first reading', () => {
    expect(createExpoNetworkAdapter(adapterConfig).getState()).toEqual({
      isOnline: true,
      status: NetworkStatusTypes.Unknown,
    })
  })

  it('listens to the platform only once no matter how many subscribers there are', () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)

    networkService.subscribe(jest.fn())
    networkService.subscribe(jest.fn())

    expect(addNetworkStateListener).toHaveBeenCalledTimes(1)
  })

  it('reads the current state as soon as the first subscriber arrives', async () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)

    networkService.subscribe(jest.fn())
    await flushPromises()

    expect(networkService.getState().status).toBe(NetworkStatusTypes.Wifi)
  })

  it('notifies every subscriber when the platform reports a new state', () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)
    const listener = jest.fn()

    networkService.subscribe(listener)
    emitNetworkState(offlineState)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(networkService.getState()).toEqual({
      isOnline: false,
      status: NetworkStatusTypes.None,
    })
  })

  it('keeps the same snapshot when the reported state has not changed', () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)
    const listener = jest.fn()

    networkService.subscribe(listener)
    emitNetworkState(offlineState)
    const snapshot = networkService.getState()
    emitNetworkState(offlineState)

    expect(networkService.getState()).toBe(snapshot)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('stops notifying a subscriber once it unsubscribes', () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)
    const listener = jest.fn()

    networkService.subscribe(listener)()
    emitNetworkState(offlineState)

    expect(listener).not.toHaveBeenCalled()
  })

  it('releases the platform listener when the last subscriber leaves', () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)
    const unsubscribe = networkService.subscribe(jest.fn())
    const otherUnsubscribe = networkService.subscribe(jest.fn())

    unsubscribe()

    expect(removeMock).not.toHaveBeenCalled()

    otherUnsubscribe()

    expect(removeMock).toHaveBeenCalledTimes(1)
  })

  it('reads the state again on refresh', async () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)
    getNetworkStateAsync.mockResolvedValue(offlineState)

    await expect(networkService.refresh()).resolves.toEqual({
      isOnline: false,
      status: NetworkStatusTypes.None,
    })
  })

  it('treats an unreadable network state as being offline', async () => {
    const networkService = createExpoNetworkAdapter(adapterConfig)
    getNetworkStateAsync.mockRejectedValue(new Error('The network state is unavailable.'))

    await expect(networkService.refresh()).resolves.toEqual({
      isOnline: false,
      status: NetworkStatusTypes.None,
    })
  })
})

describe('the network state log', () => {
  it('reports every reading while the dev tools are on', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const networkService = createExpoNetworkAdapter({ enableLogging: true })

    networkService.subscribe(jest.fn())
    await flushPromises()
    emitNetworkState(offlineState)

    expect(logSpy).toHaveBeenCalledWith('[network]', {
      isOnline: false,
      status: NetworkStatusTypes.None,
    })
  })

  it('stays quiet while the dev tools are off', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)

    createExpoNetworkAdapter(adapterConfig).subscribe(jest.fn())
    await flushPromises()

    expect(logSpy).not.toHaveBeenCalled()
  })
})
