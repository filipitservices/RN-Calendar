import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import type { ReactNode } from 'react';

import { mmkv } from '../services/storage/mmkvKeyValueStore';
import {
  appearanceOverride,
  darkColors,
  lightColors,
  ThemeContext,
} from '../ui/theme';
import type { ThemeContextValue } from '../ui/theme';

const APPEARANCE_KEY = 'prefs/appearance';

export type AppearanceProviderProps = {
  children: ReactNode;
};

/**
 * Device appearance preference. MMKV holds an explicit light/dark choice or
 * nothing (follow system). `Appearance.setColorScheme` is the RN override;
 * `useColorScheme` is the resolved scheme used to pick a palette.
 */
export const AppearanceProvider = ({ children }: AppearanceProviderProps) => {
  const [stored, setStored] = useMMKVString(APPEARANCE_KEY, mmkv);
  const resolved = useColorScheme();

  useLayoutEffect(() => {
    Appearance.setColorScheme(appearanceOverride(stored));
  }, [stored]);

  const scheme = resolved === 'dark' ? 'dark' : 'light';
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const toggleAppearance = useCallback(() => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    setStored(next);
    Appearance.setColorScheme(next);
  }, [scheme, setStored]);

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, scheme, toggleAppearance }),
    [colors, scheme, toggleAppearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
