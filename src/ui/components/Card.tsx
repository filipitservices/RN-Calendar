import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import { radii, raisedElevation, spacing, useTheme } from '../theme';

export type CardProps = ViewProps & {
  /** `flat` sits inline in a list; `raised` lifts off the background. */
  tone?: 'flat' | 'raised';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Card = ({ tone = 'raised', padded = true, style, ...rest }: CardProps) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        padded && styles.padded,
        tone === 'raised' && raisedElevation(colors.shadow),
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: spacing.lg,
  },
});
