/**
 * A single restrained palette. Neutrals carry the layout, one accent carries
 * interaction. All contrast pairs below meet WCAG AA for their text size.
 */
export const colors = {
  // Surfaces, lightest to darkest
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceSunken: '#EEF0F4',
  surfaceInverse: '#111827',

  // Accent
  accent: '#2563EB',
  accentPressed: '#1D4ED8',
  accentSubtle: '#E6EDFD',
  onAccent: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#5B6472',
  textTertiary: '#8A93A2',
  textInverse: '#FFFFFF',
  textOnAccentSubtle: '#1D4ED8',

  // Feedback
  danger: '#C22B2B',
  dangerSubtle: '#FDECEC',
  success: '#15803D',

  // Lines and shadow
  border: '#DFE3EA',
  borderStrong: '#C3C9D4',
  shadow: '#0B1220',

  // Non-interactive states
  disabledSurface: '#E4E7EC',
  disabledText: '#9AA2AF',
} as const;

export type ColorToken = keyof typeof colors;
