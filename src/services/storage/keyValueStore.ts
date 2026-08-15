/**
 * Device-local string store for small prefs (last email, biometric opt-in,
 * …). Auth sessions and events live on Firebase, not here.
 */
export type KeyValueStore = {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

/**
 * Reads and JSON-parses a value. Returns null when absent or unparseable —
 * callers are expected to decode the `unknown` into a domain type themselves.
 */
export const readJson = async (store: KeyValueStore, key: string): Promise<unknown> => {
  const raw = await store.read(key);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    // A corrupt entry is treated as absent rather than crashing the app.
    return null;
  }
};

export const writeJson = (store: KeyValueStore, key: string, value: unknown): Promise<void> =>
  store.write(key, JSON.stringify(value));
