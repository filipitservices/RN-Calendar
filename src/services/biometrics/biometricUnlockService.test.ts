import { createBiometricUnlockService } from './biometricUnlockService';
import { createMemoryKeyValueStore } from '../../testing/fakes/keyValueStore';
import { createMemorySecureCredentialStore } from '../../testing/fakes/secureCredentialStore';
import { err } from '../../lib/result';

describe('createBiometricUnlockService', () => {
  const setup = (biometry: 'fingerprint' | 'none' = 'fingerprint') => {
    const prefs = createMemoryKeyValueStore();
    const credentials = createMemorySecureCredentialStore({ biometry });
    return { prefs, service: createBiometricUnlockService(prefs, credentials) };
  };

  it('does not treat hardware as configured', async () => {
    const { service } = setup();
    await expect(service.capability()).resolves.toEqual({ status: 'ready' });
    await expect(service.isConfiguredFor('u1')).resolves.toBe(false);
  });

  it('enables only after a successful credential write, bound to that user', async () => {
    const { service } = setup();
    const result = await service.enable('u1');
    expect(result.ok).toBe(true);
    await expect(service.isConfiguredFor('u1')).resolves.toBe(true);
    await expect(service.isConfiguredFor('u2')).resolves.toBe(false);
  });

  it('authenticate returns the stored user id', async () => {
    const { service } = setup();
    await service.enable('u1');
    const result = await service.authenticate();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('u1');
    }
  });

  it('disable removes the configuration', async () => {
    const { service } = setup();
    await service.enable('u1');
    await service.disable();
    await expect(service.isConfiguredFor('u1')).resolves.toBe(false);
  });

  it('clears another user\'s leftover configuration without prompting', async () => {
    const { service } = setup();
    await service.enable('u1');
    await service.clearIfUserMismatch('u2');
    await expect(service.isConfiguredFor('u1')).resolves.toBe(false);
  });

  it('refuses to enable when the device has no biometry', async () => {
    const { service } = setup('none');
    const result = await service.enable('u1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('unavailable');
    }
  });

  it('stores last email as non-secret metadata', async () => {
    const { service } = setup();
    await service.rememberEmail('alex@example.com');
    await expect(service.lastEmail()).resolves.toBe('alex@example.com');
  });

  it('invalidates when authenticate cannot read the item', async () => {
    const prefs = createMemoryKeyValueStore();
    const credentials = createMemorySecureCredentialStore({
      biometry: 'fingerprint',
      onGet: () => err({ kind: 'invalidated' }),
    });
    const service = createBiometricUnlockService(prefs, credentials);
    await service.enable('u1');
    const result = await service.authenticate();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalidated');
    }
  });
});
