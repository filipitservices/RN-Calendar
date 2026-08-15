import type { KeyValueStore } from './keyValueStore';

/**
 * In-memory implementation used by tests so service behaviour can be verified
 * without mocking the AsyncStorage native module.
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
