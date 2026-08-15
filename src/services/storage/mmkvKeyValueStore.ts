import { createMMKV, type MMKV } from 'react-native-mmkv';

import type { KeyValueStore } from './keyValueStore';

/**
 * The one place in the app that knows MMKV exists. The instance id namespaces
 * this app's data; keys at the KeyValueStore boundary stay unprefixed
 * (`auth/accounts`, `events/${userId}`, …).
 */
const INSTANCE_ID = 'calendarapp';

/**
 * Adapts a synchronous MMKV instance to the async string-only KeyValueStore
 * contract. Missing keys become `null` (MMKV's `getString` returns `undefined`);
 * throws from `set`/`remove` become rejected promises so callers' existing
 * `try/catch` still maps them to `storageUnavailable`.
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

export const mmkvKeyValueStore = createMmkvKeyValueStore(createMMKV({ id: INSTANCE_ID }));
