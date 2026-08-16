import { StyleSheet, View } from 'react-native';

import type { CalendarDate } from '../../../domain/date/calendarDate';
import { formatMonthYear, formatWeekdayShort } from '../../../domain/date/format';
import { weekdayOrder } from '../../../domain/date/monthGrid';
import type { MonthGrid as MonthGridModel } from '../../../domain/date/monthGrid';
import { Text } from '../../../ui/components';
import { spacing } from '../../../ui/theme';
import { DayCell } from './DayCell';

export type MonthGridProps = {
  grid: MonthGridModel;
  selected: CalendarDate;
  today: CalendarDate;
  eventCounts: ReadonlyMap<CalendarDate, number>;
  onSelectDate: (date: CalendarDate) => void;
};

/**
 * The month view. Layout is pure flex — each row divides the available width
 * into seven equal cells — so the grid adapts to any screen width or
 * orientation without measuring the window.
 */
export const MonthGrid = ({
  grid,
  selected,
  today,
  eventCounts,
  onSelectDate,
}: MonthGridProps) => (
  <View accessibilityLabel={`Calendar for ${formatMonthYear(grid.yearMonth)}`}>
    <View
      style={styles.weekdayRow}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {weekdayOrder(grid.weekStart).map(weekday => (
        <View key={weekday} style={styles.weekdayCell}>
          <Text variant="overline" color="tertiary">
            {formatWeekdayShort(weekday).slice(0, 3).toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
    {grid.weeks.map(week => (
      // The first date of a row is a stable, unique key across months.
      <View key={week[0]?.date} style={styles.week}>
        {week.map(({ date, isInMonth }) => (
          <DayCell
            key={date}
            date={date}
            isInMonth={isInMonth}
            isSelected={date === selected}
            isToday={date === today}
            eventCount={eventCounts.get(date) ?? 0}
            onSelect={onSelectDate}
          />
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  week: {
    flexDirection: 'row',
    marginBottom: spacing.xxs,
  },
});
