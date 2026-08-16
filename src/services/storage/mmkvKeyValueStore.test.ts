import { createMMKV } from 'react-native-mmkv';

import { createMmkvKeyValueStore } from './mmkvKeyValueStore';

const createStore = () =>
  createMmkvKeyValueStore(createMMKV({ id: `calendarapp-test-${Date.now()}-${Math.random()}` }));

describe('createMmkvKeyValueStore', () => {
  it('returns null for a missing key and round-trips a write', async () => {
    const store = createStore();
    await expect(store.read('missing')).resolves.toBeNull();
    await store.write('prefs/lastLoggedInEmail', 'alex@example.com');
    await expect(store.read('prefs/lastLoggedInEmail')).resolves.toBe('alex@example.com');
  });

  it('rejects when MMKV refuses the write (empty key)', async () => {
    const store = createStore();
    await expect(store.write('', 'x')).rejects.toThrow();
  });
});
