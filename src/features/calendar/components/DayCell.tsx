import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toDateParts } from '../../../domain/date/calendarDate';
import type { CalendarDate } from '../../../domain/date/calendarDate';
import { formatFullDate } from '../../../domain/date/format';
import { colors, radii, spacing } from '../../../ui/theme';
import { Text } from '../../../ui/components';

/** Beyond this, the count is summarised rather than drawing a dot per event. */
const MAX_DOTS = 3;

export type DayCellProps = {
  date: CalendarDate;
  isInMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  eventCount: number;
  onSelect: (date: CalendarDate) => void;
};

const DayCellComponent = ({
  date,
  isInMonth,
  isSelected,
  isToday,
  eventCount,
  onSelect,
}: DayCellProps) => {
  const { day } = toDateParts(date);
  const dots = Math.min(eventCount, MAX_DOTS);

  return (
    <Pressable
      onPress={() => onSelect(date)}
      accessibilityRole="button"
      accessibilityLabel={formatFullDate(date)}
      accessibilityHint={
        eventCount === 0
          ? 'No events'
          : `${eventCount} ${eventCount === 1 ? 'event' : 'events'}`
      }
      // `selected` is what a screen reader announces; the fill colour is only
      // the visual half of the same information.
      accessibilityState={{ selected: isSelected }}
      style={styles.pressable}>
      <View
        style={[
          styles.marker,
          isToday && !isSelected && styles.markerToday,
          isSelected && styles.markerSelected,
        ]}>
        <Text
          variant={isSelected || isToday ? 'bodyStrong' : 'body'}
          color={isSelected ? 'inverse' : isInMonth ? 'primary' : 'tertiary'}>
          {day}
        </Text>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: dots }, (_, index) => (
          <View
            key={index}
            style={[styles.dot, isSelected ? styles.dotOnSelected : styles.dotDefault]}
          />
        ))}
      </View>
    </Pressable>
  );
};

/**
 * Memoised because a month renders 42 cells and paging or reselecting would
 * otherwise re-render all of them.
 */
export const DayCell = memo(DayCellComponent);

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxs,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  markerToday: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  markerSelected: {
    backgroundColor: colors.accent,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radii.pill,
  },
  dotDefault: {
    backgroundColor: colors.accent,
  },
  dotOnSelected: {
    backgroundColor: colors.accent,
    opacity: 0.75,
  },
});
