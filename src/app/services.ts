import { createFirebaseAuthService } from '../services/auth/firebaseAuthService';
import { createFirestoreEventService } from '../services/events/firestoreEventService';
import { mmkvKeyValueStore } from '../services/storage/mmkvKeyValueStore';

/**
 * The single place where interfaces are bound to implementations.
 */
export const authService = createFirebaseAuthService();

export const eventService = createFirestoreEventService();

/** Device-local prefs. Do not put accounts or calendar events here. */
export const keyValueStore = mmkvKeyValueStore;
