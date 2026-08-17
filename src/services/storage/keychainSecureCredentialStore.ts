import {
  ACCESS_CONTROL,
  ACCESSIBLE,
  BIOMETRY_TYPE,
  STORAGE_TYPE,
  getGenericPassword,
  getSupportedBiometryType,
  hasGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';

import { err, ok } from '../../lib/result';
import { mapSecureCredentialError } from './mapSecureCredentialError';
import type {
  AuthPrompt,
  SecureCredentialResult,
  SecureCredentialStore,
  SupportedBiometry,
} from './secureCredentialStore';

const SERVICE = 'com.calendarapp.biometricUnlock';

const promptOf = (prompt: AuthPrompt) => ({
  title: prompt.title,
  subtitle: prompt.description,
  description: prompt.description,
  cancel: prompt.cancel,
});

const accessOptions = (prompt: AuthPrompt) => ({
  service: SERVICE,
  accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  storage: STORAGE_TYPE.AES_GCM,
  authenticationPrompt: promptOf(prompt),
});

const biometryOf = (value: string | null): SupportedBiometry => {
  switch (value) {
    case BIOMETRY_TYPE.TOUCH_ID:
    case BIOMETRY_TYPE.FINGERPRINT:
      return 'fingerprint';
    case BIOMETRY_TYPE.FACE_ID:
    case BIOMETRY_TYPE.FACE:
    case BIOMETRY_TYPE.OPTIC_ID:
      return 'face';
    case BIOMETRY_TYPE.IRIS:
      return 'iris';
    default:
      return 'none';
  }
};

/**
 * The only module that imports react-native-keychain. Stores a nonce gated by
 * the current biometric set, never Firebase tokens or passwords.
 */
export const createKeychainSecureCredentialStore = (): SecureCredentialStore => ({
  has: () => hasGenericPassword({ service: SERVICE }),

  async set(username, secret, prompt): Promise<SecureCredentialResult<void>> {
    try {
      const stored = await setGenericPassword(username, secret, accessOptions(prompt));
      return stored === false ? err({ kind: 'failed' }) : ok(undefined);
    } catch (error) {
      return err(mapSecureCredentialError(error));
    }
  },

  async get(prompt): Promise<SecureCredentialResult<{ username: string; secret: string }>> {
    try {
      const stored = await getGenericPassword(accessOptions(prompt));
      if (stored === false) {
        return err({ kind: 'invalidated' });
      }
      return ok({ username: stored.username, secret: stored.password });
    } catch (error) {
      return err(mapSecureCredentialError(error));
    }
  },

  async remove() {
    await resetGenericPassword({ service: SERVICE });
  },

  async supportedBiometry() {
    try {
      return biometryOf(await getSupportedBiometryType());
    } catch (error) {
      return mapSecureCredentialError(error).kind === 'notEnrolled' ? 'notEnrolled' : 'none';
    }
  },
});
