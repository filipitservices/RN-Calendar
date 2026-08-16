import { createElement } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import type { ColorPalette } from '../ui/theme';
import { typography } from '../ui/theme';
import { AppearanceToggle } from './AppearanceToggle';

export const navigationThemeFor = (colors: ColorPalette, scheme: 'light' | 'dark'): Theme => {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.danger,
    },
  };
};

export const appearanceHeaderRight = () => createElement(AppearanceToggle);

export const stackScreenOptionsFor = (
  colors: ColorPalette,
  scheme: 'light' | 'dark',
): NativeStackNavigationOptions => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.accent,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  headerShadowVisible: false,
  headerTitleAlign: 'center',
  headerBackButtonDisplayMode: 'minimal',
  statusBarStyle: scheme === 'dark' ? 'light' : 'dark',
  animation: 'slide_from_right',
});
