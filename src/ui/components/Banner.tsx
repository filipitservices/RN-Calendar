import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

export type BannerProps = {
  tone: 'danger' | 'info';
  message: string;
};

/**
 * Form-level feedback (submission failures, invalid credentials) as opposed to
 * per-field validation, which `TextField` renders. Announced on appearance so
 * the failure is not communicated by color alone.
 */
export const Banner = ({ tone, message }: BannerProps) => (
  <View
    style={[styles.root, tone === 'danger' ? styles.danger : styles.info]}
    accessibilityRole="alert"
    accessibilityLiveRegion="polite">
    <Text variant="caption" color={tone === 'danger' ? 'danger' : 'accent'}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  danger: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.danger,
  },
  info: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
});
