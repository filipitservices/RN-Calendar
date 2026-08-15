import { DefaultTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';

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

/** Header styling shared by every stack screen that shows a header. */
export const sharedHeaderOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.accent,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  headerShadowVisible: false,
} as const;
