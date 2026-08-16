/**
 * Semantic palettes. Light and dark share the same token names so components
 * never branch on scheme. Contrast pairs are intended to meet WCAG AA.
 */
export type ColorPalette = {
  readonly background: string;
  readonly surface: string;
  readonly surfaceSunken: string;
  readonly surfaceInverse: string;
  readonly accent: string;
  readonly accentPressed: string;
  readonly accentSubtle: string;
  readonly onAccent: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textTertiary: string;
  readonly textInverse: string;
  readonly textOnAccentSubtle: string;
  readonly danger: string;
  readonly dangerPressed: string;
  readonly dangerSubtle: string;
  readonly success: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly shadow: string;
  readonly disabledSurface: string;
  readonly disabledText: string;
};

export const lightColors: ColorPalette = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceSunken: '#EEF0F4',
  surfaceInverse: '#111827',
  accent: '#2563EB',
  accentPressed: '#1D4ED8',
  accentSubtle: '#E6EDFD',
  onAccent: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#5B6472',
  textTertiary: '#8A93A2',
  textInverse: '#FFFFFF',
  textOnAccentSubtle: '#1D4ED8',
  danger: '#9A5B5B',
  dangerPressed: '#E8D6D6',
  dangerSubtle: '#F4EBEB',
  success: '#15803D',
  border: '#DFE3EA',
  borderStrong: '#C3C9D4',
  shadow: '#0B1220',
  disabledSurface: '#E4E7EC',
  disabledText: '#9AA2AF',
};

export const darkColors: ColorPalette = {
  background: '#0F1218',
  surface: '#1A1F2A',
  surfaceSunken: '#141824',
  surfaceInverse: '#F3F4F6',
  accent: '#5B8DEF',
  accentPressed: '#3B6FE0',
  accentSubtle: '#1A2A4A',
  onAccent: '#F8FAFC',
  textPrimary: '#F3F4F6',
  textSecondary: '#A0A8B8',
  textTertiary: '#7A8290',
  textInverse: '#F8FAFC',
  textOnAccentSubtle: '#93C5FD',
  danger: '#C9A0A0',
  dangerPressed: '#3A3032',
  dangerSubtle: '#2C2426',
  success: '#4ADE80',
  border: '#2A3140',
  borderStrong: '#3D4658',
  shadow: '#000000',
  disabledSurface: '#252A35',
  disabledText: '#6B7380',
};

export type ColorToken = keyof ColorPalette;

/** Maps a stored preference onto the RN Appearance override. Absent = follow system. */
export const appearanceOverride = (
  stored: string | undefined,
): 'light' | 'dark' | 'auto' => (stored === 'light' || stored === 'dark' ? stored : 'auto');
