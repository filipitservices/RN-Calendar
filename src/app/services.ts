import { createFirebaseAuthService } from '../services/auth/firebaseAuthService';
import { createBiometricUnlockService } from '../services/biometrics/biometricUnlockService';
import { createFirestoreEventService } from '../services/events/firestoreEventService';
import { createKeychainSecureCredentialStore } from '../services/storage/keychainSecureCredentialStore';
import { mmkvKeyValueStore } from '../services/storage/mmkvKeyValueStore';

export const authService = createFirebaseAuthService();

export const eventService = createFirestoreEventService();

/** Device-local prefs. Do not put accounts, calendar events, or secrets here. */
export const keyValueStore = mmkvKeyValueStore;

export const biometricUnlockService = createBiometricUnlockService(
  keyValueStore,
  createKeychainSecureCredentialStore(),
);
