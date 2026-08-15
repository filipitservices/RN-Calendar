import { createLocalAuthService } from '../services/auth/localAuthService';
import { createLocalEventService } from '../services/events/localEventService';
import { mmkvKeyValueStore } from '../services/storage/mmkvKeyValueStore';

/**
 * The single place where interfaces are bound to implementations. Swapping the
 * MVP's device-local persistence for a backend means changing these two lines.
 */
export const authService = createLocalAuthService(mmkvKeyValueStore);

export const eventService = createLocalEventService(mmkvKeyValueStore);
