import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toDateParts } from '../../../domain/date/calendarDate';
import type { CalendarDate } from '../../../domain/date/calendarDate';
import { formatFullDate } from '../../../domain/date/format';
import { radii, spacing, useTheme } from '../../../ui/theme';
import { Text } from '../../../ui/components';

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
  const { colors } = useTheme();
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
      accessibilityState={{ selected: isSelected }}
      style={styles.pressable}>
      <View
        style={[
          styles.marker,
          isToday && !isSelected && { borderColor: colors.accent, backgroundColor: colors.accentSubtle },
          isSelected && { backgroundColor: colors.accent },
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
            style={[
              styles.dot,
              { backgroundColor: colors.accent },
              isSelected && styles.dotOnSelected,
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
};

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
  dotOnSelected: {
    opacity: 0.75,
  },
});
