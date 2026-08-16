/**
 * Device-local string store for small prefs (last email, biometric opt-in,
 * appearance). Auth sessions and events live on Firebase, not here.
 */
export type KeyValueStore = {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};
