import { createMMKV, type MMKV } from 'react-native-mmkv';

import type { KeyValueStore } from './keyValueStore';

/**
 * The one place in the app that knows MMKV exists. The instance id namespaces
 * this app's data; keys at the KeyValueStore boundary stay unprefixed
 * (`prefs/lastLoggedInEmail`, …). Auth and events are not stored here.
 */
const INSTANCE_ID = 'calendarapp';

/** The single MMKV instance. Appearance and other prefs must reuse this. */
export const mmkv = createMMKV({ id: INSTANCE_ID });

/**
 * Adapts a synchronous MMKV instance to the async string-only KeyValueStore
 * contract. Missing keys become `null` (MMKV's `getString` returns `undefined`);
 * throws from `set`/`remove` become rejected promises so callers can map them
 * to an unavailable failure.
 */
export const createMmkvKeyValueStore = (storage: MMKV): KeyValueStore => ({
  read: async key => storage.getString(key) ?? null,
  write: async (key, value) => {
    storage.set(key, value);
  },
  remove: async key => {
    storage.remove(key);
  },
});

export const mmkvKeyValueStore = createMmkvKeyValueStore(mmkv);
