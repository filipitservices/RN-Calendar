import { StyleSheet, View } from 'react-native';

import { formatWeekdayShort } from '../../../domain/date/format';
import { weekdayOrder } from '../../../domain/date/monthGrid';
import type { WeekStart } from '../../../domain/date/monthGrid';
import { spacing } from '../../../ui/theme';
import { Text } from '../../../ui/components';

export type WeekdayHeaderProps = {
  weekStart: WeekStart;
};

/**
 * Column labels for the month grid. Hidden from assistive technology because
 * each day cell already announces its full weekday, so reading the header
 * would only add noise.
 */
export const WeekdayHeader = ({ weekStart }: WeekdayHeaderProps) => (
  <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {weekdayOrder(weekStart).map(weekday => (
      <View key={weekday} style={styles.cell}>
        <Text variant="overline" color="tertiary">
          {formatWeekdayShort(weekday).slice(0, 3).toUpperCase()}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
});
