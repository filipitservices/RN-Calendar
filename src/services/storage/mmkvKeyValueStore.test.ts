import { createMMKV } from 'react-native-mmkv';

import { createMmkvKeyValueStore } from './mmkvKeyValueStore';

const createStore = () =>
  createMmkvKeyValueStore(createMMKV({ id: `calendarapp-test-${Date.now()}-${Math.random()}` }));

describe('createMmkvKeyValueStore', () => {
  it('returns null for a key that has never been written', async () => {
    const store = createStore();
    await expect(store.read('missing')).resolves.toBeNull();
  });

  it('round-trips a string value', async () => {
    const store = createStore();
    await store.write('prefs/lastLoggedInEmail', 'alex@example.com');
    await expect(store.read('prefs/lastLoggedInEmail')).resolves.toBe('alex@example.com');
  });

  it('overwrites an existing value', async () => {
    const store = createStore();
    await store.write('prefs/hasEnabledBiometrics', 'false');
    await store.write('prefs/hasEnabledBiometrics', 'true');
    await expect(store.read('prefs/hasEnabledBiometrics')).resolves.toBe('true');
  });

  it('remove makes a subsequent read return null', async () => {
    const store = createStore();
    await store.write('prefs/lastLoggedInEmail', 'alex@example.com');
    await store.remove('prefs/lastLoggedInEmail');
    await expect(store.read('prefs/lastLoggedInEmail')).resolves.toBeNull();
  });

  it('removing a missing key does not reject', async () => {
    const store = createStore();
    await expect(store.remove('never-written')).resolves.toBeUndefined();
  });

  it('rejects when MMKV refuses the write (empty key)', async () => {
    const store = createStore();
    await expect(store.write('', 'value')).rejects.toThrow();
  });
});
