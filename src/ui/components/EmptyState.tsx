import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <View style={styles.root} accessibilityRole="summary">
    <View style={styles.mark} />
    <Text variant="heading" style={styles.title}>
      {title}
    </Text>
    {description !== undefined ? (
      <Text variant="body" color="secondary" style={styles.description}>
        {description}
      </Text>
    ) : null}
    {action !== undefined ? (
      <Button label={action.label} onPress={action.onPress} variant="secondary" size="md" />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.accentSubtle,
    borderWidth: 2,
    borderColor: colors.accent,
    opacity: 0.5,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
});
