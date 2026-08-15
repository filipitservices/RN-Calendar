import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

import { colors } from './colors';

/**
 * Elevation is expressed once here because Android and iOS use different
 * mechanisms; feature code should never repeat the platform branch.
 */
const build = (level: 1 | 2, radius: number, opacity: number): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation: level * 2 },
    default: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: level },
      shadowRadius: radius,
      shadowOpacity: opacity,
    },
  });

export const elevation = {
  /** Cards and list rows resting on the background. */
  raised: build(1, 6, 0.06),
  /** Sticky headers and floating actions. */
  floating: build(2, 12, 0.1),
} as const;
