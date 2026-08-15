import { createLocalAuthService } from '../services/auth/localAuthService';
import { createLocalEventService } from '../services/events/localEventService';
import { asyncStorageKeyValueStore } from '../services/storage/asyncStorageKeyValueStore';

/**
 * The single place where interfaces are bound to implementations. Swapping the
 * MVP's device-local persistence for a backend means changing these two lines.
 */
export const authService = createLocalAuthService(asyncStorageKeyValueStore);

export const eventService = createLocalEventService(asyncStorageKeyValueStore);
