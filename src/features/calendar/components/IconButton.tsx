import { Pressable, StyleSheet, View } from 'react-native';

import { colors, MIN_TOUCH_TARGET, radii } from '../../../ui/theme';

export type ChevronDirection = 'left' | 'right';

export type IconButtonProps = {
  direction: ChevronDirection;
  onPress: () => void;
  accessibilityLabel: string;
  size?: 'sm' | 'md';
};

/**
 * Chevron control for month and day paging. The glyph is drawn with two
 * rotated bars rather than an icon font, keeping the app dependency-free while
 * still scaling with the touch target.
 */
export const IconButton = ({
  direction,
  onPress,
  accessibilityLabel,
  size = 'md',
}: IconButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={8}
    style={({ pressed }) => [
      styles.button,
      size === 'sm' && styles.buttonSmall,
      pressed && styles.buttonPressed,
    ]}>
    <View
      style={[
        styles.chevron,
        direction === 'left' ? styles.chevronLeft : styles.chevronRight,
        size === 'sm' && styles.chevronSmall,
      ]}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  buttonSmall: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
  },
  buttonPressed: {
    backgroundColor: colors.accentSubtle,
  },
  chevron: {
    width: 10,
    height: 10,
    borderColor: colors.textSecondary,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  chevronSmall: {
    width: 8,
    height: 8,
  },
  chevronLeft: {
    transform: [{ rotate: '-135deg' }],
    marginLeft: 3,
  },
  chevronRight: {
    transform: [{ rotate: '45deg' }],
    marginRight: 3,
  },
});
