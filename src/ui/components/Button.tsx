import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, MIN_TOUCH_TARGET, radii, spacing } from '../theme';
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
  const isInactive = disabled || loading;

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
        styles[variant],
        pressed && !isInactive && pressedStyles[variant],
        isInactive && styles.inactive,
        style,
      ]}>
      {/* The label stays mounted while loading so the button keeps its width. */}
      <Text
        variant="bodyStrong"
        color={isInactive ? 'tertiary' : labelColor[variant]}
        style={loading ? styles.labelHidden : undefined}>
        {label}
      </Text>
      {loading ? (
        <View style={styles.spinner} pointerEvents="none">
          <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.accent} />
        </View>
      ) : null}
    </Pressable>
  );
};

const labelColor = {
  primary: 'inverse',
  secondary: 'primary',
  ghost: 'accent',
  danger: 'inverse',
} as const;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    paddingHorizontal: spacing.lg,
  },
  md: { minHeight: MIN_TOUCH_TARGET },
  lg: { minHeight: 52 },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
  inactive: { backgroundColor: colors.disabledSurface, borderColor: 'transparent' },
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

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.accentPressed },
  secondary: { backgroundColor: colors.surfaceSunken },
  ghost: { backgroundColor: colors.accentSubtle },
  danger: { opacity: 0.85 },
});
