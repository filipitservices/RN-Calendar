import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../features/auth/AuthProvider';
import { EventsProvider } from '../features/events/EventsProvider';
import { RootNavigator } from '../navigation/RootNavigator';
import type { AuthService } from '../services/auth/authService';
import type { BiometricUnlockService } from '../services/biometrics/biometricUnlockService';
import type { EventService } from '../services/events/eventService';

export type AppShellProps = {
  authService: AuthService;
  eventService: EventService;
  biometricUnlock: BiometricUnlockService;
};

/**
 * The full application tree with its dependencies passed in. Keeping the
 * bindings out of here lets tests mount the real navigator and screens against
 * in-memory fakes from `src/testing/fakes/`, with no storage mocking.
 */
export const AppShell = ({ authService, eventService, biometricUnlock }: AppShellProps) => (
  <SafeAreaProvider>
    <StatusBar barStyle="dark-content" />
    <AuthProvider service={authService} biometricUnlock={biometricUnlock}>
      <EventsProvider service={eventService}>
        <RootNavigator />
      </EventsProvider>
    </AuthProvider>
  </SafeAreaProvider>
);
