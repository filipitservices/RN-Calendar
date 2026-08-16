import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../features/auth/AuthProvider';
import { EventsProvider } from '../features/events/EventsProvider';
import { RootNavigator } from '../navigation/RootNavigator';
import type { AuthService } from '../services/auth/authService';
import type { BiometricUnlockService } from '../services/biometrics/biometricUnlockService';
import type { EventService } from '../services/events/eventService';
import { AppearanceProvider } from './AppearanceProvider';
import { useTheme } from '../ui/theme';

export type AppShellProps = {
  authService: AuthService;
  eventService: EventService;
  biometricUnlock: BiometricUnlockService;
};

export const AppShell = ({ authService, eventService, biometricUnlock }: AppShellProps) => (
  <SafeAreaProvider>
    <AppearanceProvider>
      <ThemedStatusBar />
      <AuthProvider service={authService} biometricUnlock={biometricUnlock}>
        <EventsProvider service={eventService}>
          <RootNavigator />
        </EventsProvider>
      </AuthProvider>
    </AppearanceProvider>
  </SafeAreaProvider>
);

const ThemedStatusBar = () => {
  const { scheme } = useTheme();
  return <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />;
};
