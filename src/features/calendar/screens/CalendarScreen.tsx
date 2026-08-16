import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { CalendarDate } from '../../../domain/date/calendarDate';
import { conflictingEventIds, countEventsByDate, eventsForDate } from '../../../domain/events/event';
import type { CalendarEvent } from '../../../domain/events/event';
import type { MainScreenProps } from '../../../navigation/types';
import { Button, Card, Screen, Text } from '../../../ui/components';
import { spacing, useTheme } from '../../../ui/theme';
import { useEvents } from '../../events/EventsProvider';
import { DayAgendaHeader } from '../components/DayAgendaHeader';
import { EventListItem } from '../components/EventListItem';
import { MonthGrid } from '../components/MonthGrid';
import { MonthNavigator } from '../components/MonthNavigator';
import { useCalendar } from '../useCalendar';

export const CalendarScreen = ({ navigation }: MainScreenProps<'Calendar'>) => {
  const { colors } = useTheme();
  const { events } = useEvents();
  const calendar = useCalendar();

  const eventCounts = useMemo(() => countEventsByDate(events), [events]);
  const dayEvents = useMemo(
    () => eventsForDate(events, calendar.selected),
    [events, calendar.selected],
  );
  const conflictIds = useMemo(() => conflictingEventIds(dayEvents), [dayEvents]);

  const openCreateForm = (date: CalendarDate) =>
    navigation.navigate('EventForm', { kind: 'create', date });

  const openEditForm = (event: CalendarEvent) =>
    navigation.navigate('EventForm', { kind: 'edit', eventId: event.id });

  return (
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

      <Card
        tone="flat"
        padded={false}
        style={[styles.agenda, { borderBottomColor: colors.border }]}>
        <View style={[styles.agendaHeader, { borderBottomColor: colors.border }]}>
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
          renderItem={({ item }) => (
            <EventListItem
              event={item}
              conflicted={conflictIds.has(item.id)}
              onPress={openEditForm}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View>
              <Text variant="bodyStrong">Nothing scheduled</Text>
              <Text variant="caption" color="secondary" style={styles.emptyCopy}>
                This day is free. Add a meeting to fill it in.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.actionBar}>
          <Button
            label="New event"
            onPress={() => openCreateForm(calendar.selected)}
            accessibilityHint="Creates an event on the selected day"
          />
        </View>
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
  },
  agendaHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  separator: {
    height: spacing.sm,
  },
  emptyCopy: {
    marginTop: spacing.xs,
  },
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
});
