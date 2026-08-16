import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, MIN_TOUCH_TARGET, radii, spacing } from '../../../ui/theme';
import { Screen, Text } from '../../../ui/components';

export type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerPrompt: string;
  footerAction: string;
  onFooterPress: () => void;
};

/**
 * Shared shell for the sign-in and registration screens. Auth routes hide the
 * stack header; this layout owns the page title, top safe-area inset, and
 * footer affordance.
 */
export const AuthLayout = ({
  title,
  subtitle,
  children,
  footerPrompt,
  footerAction,
  onFooterPress,
}: AuthLayoutProps) => (
  <Screen scrollable edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <View style={styles.mark} accessible={false}>
        <View style={styles.markBar} />
        <View style={styles.markBar} />
      </View>
      <Text variant="display" style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" color="secondary">
        {subtitle}
      </Text>
    </View>

    <View style={styles.form}>{children}</View>

    <View style={styles.footer}>
      <Text variant="body" color="secondary">
        {footerPrompt}
      </Text>
      <Pressable
        onPress={onFooterPress}
        accessibilityRole="button"
        accessibilityLabel={footerAction}
        hitSlop={spacing.sm}
        style={({ pressed }) => [styles.footerButton, pressed && styles.footerButtonPressed]}>
        <Text variant="bodyStrong" color="accent">
          {footerAction}
        </Text>
      </Pressable>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  markBar: {
    height: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.onAccent,
    opacity: 0.9,
  },
  title: {
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
  },
  footerButtonPressed: {
    backgroundColor: colors.accentSubtle,
  },
});
