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
    await store.write('auth/session', '{"userId":"abc"}');
    await expect(store.read('auth/session')).resolves.toBe('{"userId":"abc"}');
  });

  it('overwrites an existing value', async () => {
    const store = createStore();
    await store.write('events/u1', '[]');
    await store.write('events/u1', '[{"id":"1"}]');
    await expect(store.read('events/u1')).resolves.toBe('[{"id":"1"}]');
  });

  it('remove makes a subsequent read return null', async () => {
    const store = createStore();
    await store.write('auth/session', '{"userId":"abc"}');
    await store.remove('auth/session');
    await expect(store.read('auth/session')).resolves.toBeNull();
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
