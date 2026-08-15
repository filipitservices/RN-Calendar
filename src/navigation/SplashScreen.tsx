import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../ui/theme';
import { Text } from '../ui/components';

/**
 * Shown while the persisted session is being restored, so the app never
 * flashes the sign-in screen at an already-authenticated user.
 */
export const SplashScreen = () => (
  <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel="Loading">
    <ActivityIndicator size="large" color={colors.accent} />
    <Text variant="caption" color="tertiary" style={styles.label}>
      Loading your calendar
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  label: {
    marginTop: 16,
  },
});
