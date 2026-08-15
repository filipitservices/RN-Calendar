import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../features/auth/AuthProvider';
import { EventsProvider } from '../features/events/EventsProvider';
import { RootNavigator } from '../navigation/RootNavigator';
import type { AuthService } from '../services/auth/authService';
import type { EventService } from '../services/events/eventService';

export type AppShellProps = {
  authService: AuthService;
  eventService: EventService;
};

/**
 * The full application tree with its dependencies passed in. Keeping the
 * bindings out of here lets tests mount the real navigator and screens against
 * in-memory services, with no storage mocking.
 */
export const AppShell = ({ authService, eventService }: AppShellProps) => (
  <SafeAreaProvider>
    {/* The app is edge-to-edge; only the bar content style is ours to set,
        since `translucent` and `backgroundColor` were removed in RN 0.87. */}
    <StatusBar barStyle="dark-content" />
    <AuthProvider service={authService}>
      <EventsProvider service={eventService}>
        <RootNavigator />
      </EventsProvider>
    </AuthProvider>
  </SafeAreaProvider>
);
