import { Pressable, StyleSheet, View } from 'react-native';

import { formatMonthYear } from '../../../domain/date/format';
import type { YearMonth } from '../../../domain/date/calendarDate';
import { MIN_TOUCH_TARGET, radii, spacing, useTheme } from '../../../ui/theme';
import { Text } from '../../../ui/components';
import { IconButton } from './IconButton';

export type MonthNavigatorProps = {
  yearMonth: YearMonth;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Hides the "Today" shortcut when today is already selected and in view. */
  showTodayShortcut: boolean;
};

export const MonthNavigator = ({
  yearMonth,
  onPrevious,
  onNext,
  onToday,
  showTodayShortcut,
}: MonthNavigatorProps) => {
  const { colors } = useTheme();
  const label = formatMonthYear(yearMonth);

  return (
    <View style={styles.root}>
      <View style={styles.titleGroup}>
        {/* The month label is a header so screen readers can jump to it, and it
            is announced on change when paging. */}
        <Text variant="title" accessibilityRole="header" accessibilityLiveRegion="polite">
          {label}
        </Text>
      </View>

      <View style={styles.controls}>
        {showTodayShortcut ? (
          <Pressable
            onPress={onToday}
            accessibilityRole="button"
            accessibilityLabel="Go to today"
            style={({ pressed }) => [
              styles.todayButton,
              {
                borderColor: colors.accent,
                backgroundColor: pressed ? colors.accent : colors.accentSubtle,
              },
            ]}>
            {({ pressed }) => (
              <Text variant="caption" color={pressed ? 'inverse' : 'accent'} style={styles.todayLabel}>
                Today
              </Text>
            )}
          </Pressable>
        ) : null}
        <IconButton
          direction="left"
          onPress={onPrevious}
          accessibilityLabel="Previous month"
        />
        <IconButton direction="right" onPress={onNext} accessibilityLabel="Next month" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  titleGroup: {
    flex: 1,
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  todayButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  todayLabel: {
    fontWeight: '600',
  },
});
