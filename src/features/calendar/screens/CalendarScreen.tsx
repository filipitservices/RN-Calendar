import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { CalendarDate } from '../../../domain/date/calendarDate';
import { countEventsByDate, eventsForDate } from '../../../domain/events/event';
import type { CalendarEvent } from '../../../domain/events/event';
import type { MainScreenProps } from '../../../navigation/types';
import { Button, Card, EmptyState, Screen } from '../../../ui/components';
import { colors, spacing } from '../../../ui/theme';
import { useEvents } from '../../events/EventsProvider';
import { DayAgendaHeader } from '../components/DayAgendaHeader';
import { EventListItem } from '../components/EventListItem';
import { MonthGrid } from '../components/MonthGrid';
import { MonthNavigator } from '../components/MonthNavigator';
import { useCalendar } from '../useCalendar';

export const CalendarScreen = ({ navigation }: MainScreenProps<'Calendar'>) => {
  const { events } = useEvents();
  const calendar = useCalendar();

  // Both derived during render from the single events list — no duplicated state.
  const eventCounts = useMemo(() => countEventsByDate(events), [events]);
  const dayEvents = useMemo(
    () => eventsForDate(events, calendar.selected),
    [events, calendar.selected],
  );

  const openCreateForm = (date: CalendarDate) =>
    navigation.navigate('EventForm', { kind: 'create', date });

  const openEditForm = (event: CalendarEvent) =>
    navigation.navigate('EventForm', { kind: 'edit', eventId: event.id });

  return (
    // The main nav bar owns the bottom inset and the stack header owns the top.
    <Screen padded={false}>
      <View style={styles.calendarSection}>
        <MonthNavigator
          yearMonth={calendar.visibleMonth}
          onPrevious={calendar.goToPreviousMonth}
          onNext={calendar.goToNextMonth}
          onToday={calendar.goToToday}
          showTodayShortcut={calendar.selected !== calendar.today}
        />
        <MonthGrid
          grid={calendar.grid}
          selected={calendar.selected}
          today={calendar.today}
          eventCounts={eventCounts}
          onSelectDate={calendar.selectDate}
        />
      </View>

      <Card tone="flat" padded={false} style={styles.agenda}>
        <View style={styles.agendaHeader}>
          <DayAgendaHeader
            date={calendar.selected}
            today={calendar.today}
            eventCount={dayEvents.length}
            onPreviousDay={calendar.goToPreviousDay}
            onNextDay={calendar.goToNextDay}
          />
        </View>

        <FlatList
          data={dayEvents}
          keyExtractor={event => event.id}
          renderItem={({ item }) => <EventListItem event={item} onPress={openEditForm} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              title="Nothing scheduled"
              description="This day is free. Add a meeting to fill it in."
              action={{
                label: 'New event',
                onPress: () => openCreateForm(calendar.selected),
              }}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {dayEvents.length > 0 ? (
          <View style={styles.actionBar}>
            <Button
              label="New event"
              onPress={() => openCreateForm(calendar.selected)}
              accessibilityHint="Creates an event on the selected day"
            />
          </View>
        ) : null}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  calendarSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  agenda: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    backgroundColor: colors.surface,
  },
  agendaHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: 0,
  },
  separator: {
    height: spacing.sm,
  },
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
});
