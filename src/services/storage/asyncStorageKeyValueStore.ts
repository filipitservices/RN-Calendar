import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValueStore } from './keyValueStore';

/**
 * The one place in the app that knows AsyncStorage exists. Keys are namespaced
 * so this app's data is distinguishable from anything else on the device.
 */
const NAMESPACE = 'calendarapp';

const namespaced = (key: string): string => `${NAMESPACE}:${key}`;

export const asyncStorageKeyValueStore: KeyValueStore = {
  read: key => AsyncStorage.getItem(namespaced(key)),
  write: (key, value) => AsyncStorage.setItem(namespaced(key), value),
  remove: key => AsyncStorage.removeItem(namespaced(key)),
};
