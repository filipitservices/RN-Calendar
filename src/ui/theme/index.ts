import { colors } from './colors';
import { elevation } from './elevation';
import { MIN_TOUCH_TARGET, radii, spacing } from './spacing';
import { typography } from './typography';

/**
 * The single design-token source. Import `theme` (or the individual token
 * modules) rather than writing literal colors, spacing, or font sizes.
 */
export const theme = {
  colors,
  spacing,
  radii,
  typography,
  elevation,
} as const;

export type Theme = typeof theme;

export { colors, spacing, radii, typography, elevation, MIN_TOUCH_TARGET };
