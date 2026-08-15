import { Pressable, StyleSheet, View } from 'react-native';

import type { CalendarEvent } from '../../../domain/events/event';
import { formatDuration, formatTimeRange } from '../../../domain/date/format';
import { colors, radii, spacing } from '../../../ui/theme';
import { Text } from '../../../ui/components';

export type EventListItemProps = {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
};

export const EventListItem = ({ event, onPress }: EventListItemProps) => {
  const timeRange = formatTimeRange(event.startMinutes, event.endMinutes);

  return (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${timeRange}`}
      accessibilityHint="Opens this event for editing"
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="caption" color="secondary">
            {timeRange}
          </Text>
          <View style={styles.separator} />
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
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 64,
  },
  pressed: {
    backgroundColor: colors.surfaceSunken,
  },
  accent: {
    width: 4,
    backgroundColor: colors.accent,
  },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
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
    backgroundColor: colors.borderStrong,
  },
  notes: {
    marginTop: spacing.xs,
  },
});
