import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import { colors, elevation, radii, spacing } from '../theme';

export type CardProps = ViewProps & {
  /** `flat` sits inline in a list; `raised` lifts off the background. */
  tone?: 'flat' | 'raised';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Card = ({ tone = 'raised', padded = true, style, ...rest }: CardProps) => (
  <View
    style={[styles.base, padded && styles.padded, tone === 'raised' && elevation.raised, style]}
    {...rest}
  />
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
