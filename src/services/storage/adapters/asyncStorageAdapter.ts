import AsyncStorage from '@react-native-async-storage/async-storage'

import { StorageError, type StorageServiceModel } from '../models'

const runStorageOperation = async <TResult,>(
  operation: () => Promise<TResult>,
  failureMessage: string,
): Promise<TResult> => {
  try {
    return await operation()
  } catch (error) {
    throw new StorageError(failureMessage, { cause: error })
  }
}

const toParsedValue = <TValue,>(storedValue: string | null): TValue | null => {
  if (storedValue === null) {
    return null
  }

  return JSON.parse(storedValue) as TValue
}

const getStoredValue = <TValue,>(key: string): Promise<TValue | null> =>
  runStorageOperation(
    async () => toParsedValue<TValue>(await AsyncStorage.getItem(key)),
    `The value stored under "${key}" could not be read.`,
  )

const setStoredValue = <TValue,>(key: string, value: TValue): Promise<void> =>
  runStorageOperation(
    () => AsyncStorage.setItem(key, JSON.stringify(value)),
    `The value could not be stored under "${key}".`,
  )

const removeStoredValue = (key: string): Promise<void> =>
  runStorageOperation(
    () => AsyncStorage.removeItem(key),
    `The value stored under "${key}" could not be removed.`,
  )

const clearStoredValues = (): Promise<void> =>
  runStorageOperation(
    () => AsyncStorage.clear(),
    'The storage could not be cleared.',
  )

export const createAsyncStorageAdapter = (): StorageServiceModel => ({
  getItem: getStoredValue,
  setItem: setStoredValue,
  removeItem: removeStoredValue,
  clear: clearStoredValues,
})
