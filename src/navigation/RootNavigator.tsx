import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SignInScreen } from '../features/auth/screens/SignInScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import { EventFormScreen } from '../features/events/screens/EventFormScreen';
import { useAuth } from '../features/auth/AuthProvider';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from './SplashScreen';
import { nativeStackScreenOptions, navigationTheme } from './navigationTheme';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * Authentication gating is structural: the two groups below are mutually
 * exclusive, so an authenticated user has no route back to sign-in and a
 * signed-out user has no route into the app.
 *
 * Consequently nothing calls `navigate` when auth state changes — re-declaring
 * the screen set is what performs the transition.
 */
export const RootNavigator = () => {
  const { state } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      {state.status === 'restoring' || state.status === 'unlocking' ? (
        <SplashScreen />
      ) : (
        <RootStack.Navigator screenOptions={nativeStackScreenOptions}>
          {state.status === 'signedIn' ? (
            <RootStack.Group>
              <RootStack.Screen
                name="Main"
                component={MainNavigator}
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationTypeForReplace: 'push',
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
            <RootStack.Group screenOptions={{ headerShown: false }}>
              <RootStack.Screen name="SignIn" component={SignInScreen} />
              <RootStack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{ animation: 'slide_from_right' }}
              />
            </RootStack.Group>
          )}
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
};

/**
 * Registers the root navigator's type so `useNavigation()` is typed everywhere
 * without per-call annotations. The interface lives in `@react-navigation/core`;
 * augmenting `@react-navigation/native` would silently declare a new one
 * instead of merging.
 */
type RootStackType = typeof RootStack;

declare module '@react-navigation/core' {
  interface RootNavigator extends RootStackType {}
}

/**
 * Compile-time proof that the augmentation merged. If it ever stops working,
 * `RootParamList` falls back to an empty type and this line fails to build
 * rather than silently degrading every `useNavigation()` call to `never`.
 */
export type RegisteredRoutes = keyof ReactNavigation.RootParamList;
