import { StyleSheet, View } from 'react-native';

import { radii, spacing, useTheme } from '../theme';
import { Text } from './Text';

export type BannerProps = {
  tone: 'danger' | 'info';
  message: string;
};

export const Banner = ({ tone, message }: BannerProps) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.root,
        tone === 'danger'
          ? { backgroundColor: colors.dangerSubtle, borderColor: colors.danger }
          : { backgroundColor: colors.accentSubtle, borderColor: colors.accent },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <Text variant="caption" color={tone === 'danger' ? 'danger' : 'accent'}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
