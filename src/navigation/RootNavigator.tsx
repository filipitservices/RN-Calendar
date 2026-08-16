import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SignInScreen } from '../features/auth/screens/SignInScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import { EventFormScreen } from '../features/events/screens/EventFormScreen';
import { useAuth } from '../features/auth/AuthProvider';
import { useTheme } from '../ui/theme';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from './SplashScreen';
import { navigationThemeFor, stackScreenOptionsFor } from './navigationTheme';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { state } = useAuth();
  const { colors, scheme } = useTheme();
  const screenOptions = stackScreenOptionsFor(colors, scheme);

  return (
    <NavigationContainer theme={navigationThemeFor(colors, scheme)}>
      <RootStack.Navigator screenOptions={screenOptions}>
        {state.status === 'restoring' ? (
          <RootStack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false, animation: 'none', headerRight: undefined }}
          />
        ) : state.status === 'signedIn' ? (
          <RootStack.Group>
            <RootStack.Screen
              name="Main"
              component={MainNavigator}
              options={{
                headerShown: false,
                animation: 'none',
                headerRight: undefined,
              }}
            />
            <RootStack.Screen
              name="EventForm"
              component={EventFormScreen}
              options={({ route }) => ({
                presentation: 'modal',
                animation: 'slide_from_bottom',
                title: route.params.kind === 'create' ? 'New event' : 'Edit event',
              })}
            />
          </RootStack.Group>
        ) : (
          <RootStack.Group screenOptions={{ headerShown: false, headerRight: undefined }}>
            <RootStack.Screen name="SignIn" component={SignInScreen} />
            <RootStack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

type RootStackType = typeof RootStack;

declare module '@react-navigation/core' {
  interface RootNavigator extends RootStackType {}
}

export type RegisteredRoutes = keyof ReactNavigation.RootParamList;
