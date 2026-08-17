import { AppShell } from './AppShell';
import { authService, biometricUnlockService, eventService } from './services';

export const App = () => (
  <AppShell
    authService={authService}
    eventService={eventService}
    biometricUnlock={biometricUnlockService}
  />
);
