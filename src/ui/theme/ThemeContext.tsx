import { createContext, useContext } from 'react';

import type { ColorPalette } from './colors';

export type AppearanceScheme = 'light' | 'dark';

export type ThemeContextValue = {
  colors: ColorPalette;
  scheme: AppearanceScheme;
  toggleAppearance: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme must be used within AppearanceProvider');
  }
  return value;
};
