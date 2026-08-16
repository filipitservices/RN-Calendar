import { Pressable, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';

import { MIN_TOUCH_TARGET, radii, useTheme } from '../ui/theme';

export const AppearanceToggle = () => {
  const { colors, scheme, toggleAppearance } = useTheme();
  const toDark = scheme === 'light';

  return (
    <Pressable
      onPress={toggleAppearance}
      accessibilityRole="button"
      accessibilityLabel={toDark ? 'Use dark appearance' : 'Use light appearance'}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? colors.accentSubtle : 'transparent' },
      ]}>
      {toDark ? (
        <Moon size={22} color={colors.accent} />
      ) : (
        <Sun size={22} color={colors.accent} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    marginRight: 4,
  },
});
