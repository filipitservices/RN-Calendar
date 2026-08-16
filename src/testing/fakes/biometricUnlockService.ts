import { createBiometricUnlockService } from '../../services/biometrics/biometricUnlockService';
import type { BiometricUnlockService } from '../../services/biometrics/biometricUnlockService';
import { createMemoryKeyValueStore } from './keyValueStore';
import { createMemorySecureCredentialStore } from './secureCredentialStore';
import type { MemorySecureCredentialOptions } from './secureCredentialStore';

export type TestBiometricUnlockOptions = MemorySecureCredentialOptions;

export const createTestBiometricUnlockService = (
  options: TestBiometricUnlockOptions = {},
): BiometricUnlockService =>
  createBiometricUnlockService(
    createMemoryKeyValueStore(),
    createMemorySecureCredentialStore({
      biometry: options.biometry ?? 'none',
      onSet: options.onSet,
      onGet: options.onGet,
    }),
  );
