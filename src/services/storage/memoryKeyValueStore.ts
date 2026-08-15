import type { KeyValueStore } from './keyValueStore';

/**
 * In-memory implementation used by tests so prefs and local auth/event
 * doubles can run without native MMKV or Firebase.
 */
export const createMemoryKeyValueStore = (
  initial: Readonly<Record<string, string>> = {},
): KeyValueStore => {
  const data = new Map<string, string>(Object.entries(initial));

  return {
    read: key => Promise.resolve(data.get(key) ?? null),
    write: (key, value) => {
      data.set(key, value);
      return Promise.resolve();
    },
    remove: key => {
      data.delete(key);
      return Promise.resolve();
    },
  };
};
