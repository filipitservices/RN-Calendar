import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET, radii, spacing, useTheme } from '../../../ui/theme';
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
 * Shared shell for the sign-in and registration screens. The content column is
 * vertically centered in leftover space; short screens still scroll.
 */
export const AuthLayout = ({
  title,
  subtitle,
  children,
  footerPrompt,
  footerAction,
  onFooterPress,
}: AuthLayoutProps) => {
  const { colors } = useTheme();

  return (
    <Screen
      scrollable
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.centerContent}>
      <View>
        <View style={styles.header}>
          <View style={[styles.mark, { backgroundColor: colors.accent }]} accessible={false}>
            <View style={[styles.markBar, { backgroundColor: colors.onAccent }]} />
            <View style={[styles.markBar, { backgroundColor: colors.onAccent }]} />
          </View>
          <Text variant="display" style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.form}>{children}</View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text variant="body" color="secondary">
            {footerPrompt}
          </Text>
          <Pressable
            onPress={onFooterPress}
            accessibilityRole="button"
            accessibilityLabel={footerAction}
            hitSlop={spacing.sm}
            style={({ pressed }) => [
              styles.footerButton,
              pressed && { backgroundColor: colors.accentSubtle },
            ]}>
            <Text variant="bodyStrong" color="accent">
              {footerAction}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  markBar: {
    height: 4,
    borderRadius: radii.sm,
    opacity: 0.9,
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
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
  },
  footerButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
  },
});
