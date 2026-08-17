import { err, ok } from '../../lib/result';
import type { Result } from '../../lib/result';
import type { KeyValueStore } from '../storage/keyValueStore';
import type {
  AuthPrompt,
  SecureCredentialFailure,
  SecureCredentialStore,
} from '../storage/secureCredentialStore';

const UNLOCK_USER_KEY = 'prefs/biometricUnlockUserId';
const LAST_EMAIL_KEY = 'prefs/lastLoggedInEmail';

const UNLOCK_PROMPT: AuthPrompt = {
  title: 'Unlock Calendar App',
  description: "Confirm it's you to open your calendar.",
  cancel: 'Use password',
};

const ENABLE_PROMPT: AuthPrompt = {
  title: 'Unlock Calendar App',
  description: "Confirm it's you to turn on biometric sign-in on this device.",
  cancel: 'Cancel',
};

export type BiometricCapability =
  | { status: 'unavailable' }
  | { status: 'notEnrolled' }
  | { status: 'ready' };

export type BiometricUnlockFailure = SecureCredentialFailure;

const hexOf = (bytes: Uint8Array): string =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

const nonce = (): string => {
  const bytes = new Uint8Array(32);
  const source = Reflect.get(globalThis, 'crypto');
  if (typeof source === 'object' && source !== null && 'getRandomValues' in source) {
    const fill = Reflect.get(source, 'getRandomValues');
    if (typeof fill === 'function') {
      fill.call(source, bytes);
      return hexOf(bytes);
    }
  }
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  return hexOf(bytes);
};

export type BiometricUnlockService = {
  capability(): Promise<BiometricCapability>;
  isConfiguredFor(userId: string): Promise<boolean>;
  enable(userId: string): Promise<Result<void, BiometricUnlockFailure>>;
  disable(): Promise<void>;
  authenticate(): Promise<Result<string, BiometricUnlockFailure>>;
  clearIfUserMismatch(userId: string): Promise<void>;
  rememberEmail(email: string): Promise<void>;
  lastEmail(): Promise<string | null>;
};

export const createBiometricUnlockService = (
  store: KeyValueStore,
  credentials: SecureCredentialStore,
): BiometricUnlockService => {
  const storedUserId = async (): Promise<string | null> => store.read(UNLOCK_USER_KEY);

  return {
    async capability() {
      const biometry = await credentials.supportedBiometry();
      if (biometry === 'none') {
        return { status: 'unavailable' };
      }
      if (biometry === 'notEnrolled') {
        return { status: 'notEnrolled' };
      }
      return { status: 'ready' };
    },

    async isConfiguredFor(userId) {
      const configuredUser = await storedUserId();
      if (configuredUser !== userId) {
        return false;
      }
      return credentials.has();
    },

    async enable(userId) {
      const biometry = await credentials.supportedBiometry();
      if (biometry === 'none') {
        return err({ kind: 'unavailable' });
      }
      if (biometry === 'notEnrolled') {
        return err({ kind: 'notEnrolled' });
      }
      const result = await credentials.set(userId, nonce(), ENABLE_PROMPT);
      if (!result.ok) {
        return result;
      }
      await store.write(UNLOCK_USER_KEY, userId);
      return ok(undefined);
    },

    async disable() {
      await credentials.remove();
      await store.remove(UNLOCK_USER_KEY);
    },

    async authenticate() {
      const result = await credentials.get(UNLOCK_PROMPT);
      if (!result.ok) {
        return result;
      }
      const expected = await storedUserId();
      if (expected === null || result.value.username !== expected) {
        await credentials.remove();
        await store.remove(UNLOCK_USER_KEY);
        return err({ kind: 'invalidated' });
      }
      return ok(result.value.username);
    },

    async clearIfUserMismatch(userId) {
      const configuredUser = await storedUserId();
      if (configuredUser !== null && configuredUser !== userId) {
        await credentials.remove();
        await store.remove(UNLOCK_USER_KEY);
      }
    },

    rememberEmail: email => store.write(LAST_EMAIL_KEY, email),

    lastEmail: () => store.read(LAST_EMAIL_KEY),
  };
};
