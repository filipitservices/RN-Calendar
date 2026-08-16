import { DefaultTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors, typography } from '../ui/theme';

/**
 * Maps the app's design tokens onto React Navigation's theme so navigator
 * chrome (headers, tab bar, card backgrounds) matches the rest of the UI
 * instead of falling back to platform defaults.
 */
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: DefaultTheme.fonts,
};

/**
 * Header styling shared by native-stack screens that show a header. Native
 * headers own the top safe-area inset; screens must not pad `top` again.
 */
export const sharedHeaderOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.accent,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  headerShadowVisible: false,
  headerTitleAlign: 'center' as const,
  headerBackButtonDisplayMode: 'minimal' as const,
};

/**
 * Native-stack defaults. `statusBarStyle: 'dark'` is required on Android: the
 * library default is `'light'`, which would invert icons on our light header.
 * `slide_from_right` is the documented Android-capable push animation.
 */
export const nativeStackScreenOptions: NativeStackNavigationOptions = {
  ...sharedHeaderOptions,
  statusBarStyle: 'dark',
  animation: 'slide_from_right',
};
