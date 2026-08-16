import { Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { MIN_TOUCH_TARGET, radii, useTheme } from '../../../ui/theme';

export type ChevronDirection = 'left' | 'right';

export type IconButtonProps = {
  direction: ChevronDirection;
  onPress: () => void;
  accessibilityLabel: string;
};

export const IconButton = ({
  direction,
  onPress,
  accessibilityLabel,
}: IconButtonProps) => {
  const { colors } = useTheme();
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        pressed && { backgroundColor: colors.accentSubtle },
      ]}>
      <Icon size={22} color={colors.textSecondary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
});
