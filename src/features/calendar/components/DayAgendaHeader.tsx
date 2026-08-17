import { StyleSheet, View } from 'react-native';

import type { CalendarDate } from '../../../domain/date/calendarDate';
import { formatDayHeading, relativeDayLabel } from '../../../domain/date/format';
import { radii, spacing, useTheme } from '../../../ui/theme';
import { Text } from '../../../ui/components';
import { IconButton } from './IconButton';

export type DayAgendaHeaderProps = {
  date: CalendarDate;
  today: CalendarDate;
  eventCount: number;
  onPreviousDay: () => void;
  onNextDay: () => void;
};

export const DayAgendaHeader = ({
  date,
  today,
  eventCount,
  onPreviousDay,
  onNextDay,
}: DayAgendaHeaderProps) => {
  const { colors } = useTheme();
  const relative = relativeDayLabel(date, today);

  return (
    <View style={styles.root}>
      <IconButton direction="left" onPress={onPreviousDay} accessibilityLabel="Previous day" />

      <View style={styles.titleGroup}>
        <View style={styles.titleRow}>
          <Text variant="heading" numberOfLines={1} accessibilityRole="header">
            {formatDayHeading(date)}
          </Text>
          {relative !== null ? (
            <View style={[styles.badge, { backgroundColor: colors.accentSubtle }]}>
              <Text variant="overline" color="accent">
                {relative.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" color="secondary">
          {eventCount === 0
            ? 'No events'
            : `${eventCount} ${eventCount === 1 ? 'event' : 'events'}`}
        </Text>
      </View>

      <IconButton direction="right" onPress={onNextDay} accessibilityLabel="Next day" />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  titleGroup: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
});
