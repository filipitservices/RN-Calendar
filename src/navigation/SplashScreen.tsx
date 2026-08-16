import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '../ui/theme';
import { Screen, Text } from '../ui/components';

export const SplashScreen = () => {
  const { colors } = useTheme();
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.body} accessibilityRole="progressbar" accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={colors.accent} />
        <Text variant="caption" color="tertiary" style={styles.label}>
          Loading your calendar
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: spacing.lg,
  },
});
