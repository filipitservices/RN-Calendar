import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../ui/theme';
import { Screen, Text } from '../ui/components';

/**
 * Shown while the persisted session is being restored, so the app never flashes
 * Calendar or sign-in at the wrong time.
 */
export const SplashScreen = () => (
  <Screen edges={['top', 'bottom', 'left', 'right']}>
    <View style={styles.body} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size="large" color={colors.accent} />
      <Text variant="caption" color="tertiary" style={styles.label}>
        Loading your calendar
      </Text>
    </View>
  </Screen>
);

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
