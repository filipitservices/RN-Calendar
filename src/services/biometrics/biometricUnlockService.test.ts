import { createBiometricUnlockService } from './biometricUnlockService';
import { createMemoryKeyValueStore } from '../../testing/fakes/keyValueStore';
import { createMemorySecureCredentialStore } from '../../testing/fakes/secureCredentialStore';
import { err } from '../../lib/result';

describe('createBiometricUnlockService', () => {
  const setup = (biometry: 'fingerprint' | 'none' | 'notEnrolled' = 'fingerprint') => {
    const prefs = createMemoryKeyValueStore();
    const credentials = createMemorySecureCredentialStore({ biometry });
    return { service: createBiometricUnlockService(prefs, credentials) };
  };

  it('is not configured until enable succeeds for that user', async () => {
    const { service } = setup();
    await expect(service.capability()).resolves.toEqual({ status: 'ready' });
    await expect(service.isConfiguredFor('u1')).resolves.toBe(false);

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

  it('disable and a user mismatch both clear configuration', async () => {
    const { service } = setup();
    await service.enable('u1');
    await service.disable();
    await expect(service.isConfiguredFor('u1')).resolves.toBe(false);

    await service.enable('u1');
    await service.clearIfUserMismatch('u2');
    await expect(service.isConfiguredFor('u1')).resolves.toBe(false);
  });

  it('refuses to enable when the device cannot prompt', async () => {
    const none = setup('none');
    await expect(none.service.capability()).resolves.toEqual({ status: 'unavailable' });
    const unavailable = await none.service.enable('u1');
    expect(unavailable.ok).toBe(false);
    if (!unavailable.ok) {
      expect(unavailable.error.kind).toBe('unavailable');
    }

    const empty = setup('notEnrolled');
    await expect(empty.service.capability()).resolves.toEqual({ status: 'notEnrolled' });
    const notEnrolled = await empty.service.enable('u1');
    expect(notEnrolled.ok).toBe(false);
    if (!notEnrolled.ok) {
      expect(notEnrolled.error.kind).toBe('notEnrolled');
    }
    await expect(empty.service.isConfiguredFor('u1')).resolves.toBe(false);
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
