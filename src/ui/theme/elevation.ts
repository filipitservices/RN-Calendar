import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

/**
 * Elevation is expressed once here because Android and iOS use different
 * mechanisms; feature code should never repeat the platform branch.
 */
export const raisedElevation = (shadowColor: string): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation: 2 },
    default: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 6,
      shadowOpacity: 0.06,
    },
  }) ?? { elevation: 2 };

export const floatingElevation = (shadowColor: string): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation: 4 },
    default: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 12,
      shadowOpacity: 0.1,
    },
  }) ?? { elevation: 4 };
