import { AppShell } from './AppShell';
import { authService, eventService } from './services';

/**
 * Composition root: binds the app tree to the concrete, device-backed service
 * implementations.
 */
export const App = () => <AppShell authService={authService} eventService={eventService} />;
