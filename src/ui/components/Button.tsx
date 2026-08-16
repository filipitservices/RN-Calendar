import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET, radii, spacing, useTheme } from '../theme';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  accessibilityHint,
  style,
}: ButtonProps) => {
  const { colors } = useTheme();
  const isInactive = disabled || loading;

  const fill = isInactive
    ? colors.disabledSurface
    : variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? colors.dangerSubtle
        : variant === 'secondary'
          ? colors.surface
          : 'transparent';

  const border =
    isInactive
      ? 'transparent'
      : variant === 'secondary'
        ? colors.borderStrong
        : variant === 'danger'
          ? colors.danger
          : 'transparent';

  const spinnerColor = variant === 'primary' ? colors.onAccent : colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor: pressed && !isInactive
            ? variant === 'primary'
              ? colors.accentPressed
              : variant === 'danger'
                ? colors.dangerPressed
                : variant === 'secondary'
                  ? colors.surfaceSunken
                  : colors.accentSubtle
            : fill,
          borderColor: border,
        },
        style,
      ]}>
      <Text
        variant="bodyStrong"
        color={isInactive ? 'tertiary' : labelColor[variant]}
        style={loading ? styles.labelHidden : undefined}>
        {label}
      </Text>
      {loading ? (
        <View style={styles.spinner} pointerEvents="none">
          <ActivityIndicator color={spinnerColor} />
        </View>
      ) : null}
    </Pressable>
  );
};

const labelColor = {
  primary: 'inverse',
  secondary: 'primary',
  ghost: 'accent',
  danger: 'danger',
} as const;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },
  md: { minHeight: MIN_TOUCH_TARGET },
  lg: { minHeight: 52 },
  labelHidden: { opacity: 0 },
  spinner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
