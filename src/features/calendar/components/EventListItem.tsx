import { Pressable, StyleSheet, View } from 'react-native';

import type { CalendarEvent } from '../../../domain/events/event';
import { formatDuration, formatTimeRange } from '../../../domain/date/format';
import { radii, spacing, useTheme } from '../../../ui/theme';
import { Text } from '../../../ui/components';

export type EventListItemProps = {
  event: CalendarEvent;
  conflicted?: boolean;
  onPress: (event: CalendarEvent) => void;
};

export const EventListItem = ({ event, conflicted = false, onPress }: EventListItemProps) => {
  const { colors } = useTheme();
  const timeRange = formatTimeRange(event.startMinutes, event.endMinutes);
  const accessibilityLabel = conflicted
    ? `${event.title}, ${timeRange}, conflicted`
    : `${event.title}, ${timeRange}`;

  return (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens this event for editing"
      style={({ pressed }) => [
        styles.root,
        {
          backgroundColor: pressed ? colors.surfaceSunken : colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View style={[styles.accent, { backgroundColor: colors.accent }]} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.title}>
            {event.title}
          </Text>
          {conflicted ? (
            <View style={[styles.chip, { backgroundColor: colors.dangerSubtle }]}>
              <Text variant="overline" color="danger">
                Conflicted
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.meta}>
          <Text variant="caption" color="secondary">
            {timeRange}
          </Text>
          <View style={[styles.separator, { backgroundColor: colors.borderStrong }]} />
          <Text variant="caption" color="tertiary">
            {formatDuration(event.startMinutes, event.endMinutes)}
          </Text>
        </View>
        {event.notes !== null ? (
          <Text variant="caption" color="secondary" numberOfLines={2} style={styles.notes}>
            {event.notes}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minHeight: 64,
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: radii.pill,
  },
  notes: {
    marginTop: spacing.xs,
  },
});
