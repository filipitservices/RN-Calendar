import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import type { CalendarDate } from '../../../domain/date/calendarDate';
import { formatFullDate } from '../../../domain/date/format';
import type { CalendarEvent } from '../../../domain/events/event';
import { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH } from '../../../domain/events/validation';
import type { RootStackScreenProps } from '../../../navigation/types';
import { Banner, Button, Card, Screen, Text, TextField } from '../../../ui/components';
import { colors, spacing } from '../../../ui/theme';
import { eventFailureMessage, useEvents } from '../EventsProvider';
import { TimeOfDayField } from '../components/TimeOfDayField';
import { useEventForm } from '../useEventForm';

/**
 * Creating and editing an event are the same domain operation, so they share
 * one screen, one form hook, and one validator. The route param's discriminant
 * decides only which persistence call runs and how the screen is titled.
 */
export const EventFormScreen = ({ route, navigation }: RootStackScreenProps<'EventForm'>) => {
  const { events } = useEvents();
  const params = route.params;

  const existing =
    params.kind === 'edit' ? (events.find(event => event.id === params.eventId) ?? null) : null;
  const date = params.kind === 'create' ? params.date : (existing?.date ?? null);

  // An edited event can legitimately disappear (deleted elsewhere) while this
  // screen is mounted, so this is a real state to handle, not a bug.
  if (date === null) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <View style={styles.missing}>
          <Text variant="heading" style={styles.missingText}>
            This event is no longer available.
          </Text>
          <Button label="Go back" variant="secondary" onPress={navigation.goBack} />
        </View>
      </Screen>
    );
  }

  return (
    <EventFormBody
      // Remounting on identity change resets the form fields cleanly rather
      // than syncing them with an effect.
      key={existing?.id ?? `create-${date}`}
      date={date}
      existing={existing}
      onDone={navigation.goBack}
    />
  );
};

type EventFormBodyProps = {
  date: CalendarDate;
  existing: CalendarEvent | null;
  onDone: () => void;
};

const EventFormBody = ({ date, existing, onDone }: EventFormBodyProps) => {
  const { createEvent, updateEvent, deleteEvent } = useEvents();
  const form = useEventForm(date, existing);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const errorFor = (field: keyof typeof form.errors) =>
    form.showErrors ? form.errors[field] : undefined;

  const handleSubmit = async () => {
    const draft = form.submit();
    if (draft === null) {
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    const failure =
      existing === null ? await createEvent(draft) : await updateEvent(existing.id, draft);
    setIsSaving(false);
    if (failure === null) {
      onDone();
    } else {
      setSubmitError(eventFailureMessage(failure));
    }
  };

  const handleDelete = () => {
    if (existing === null) {
      return;
    }
    Alert.alert('Delete event', `Are you sure you want to delete ${existing.title} from your calendar?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          void deleteEvent(existing.id).then(failure => {
            if (failure === null) {
              onDone();
            } else {
              setSubmitError(eventFailureMessage(failure));
            }
          });
        },
      },
    ]);
  };

  return (
    <Screen scrollable edges={['left', 'right', 'bottom']}>
      <Card tone="flat" style={styles.dateCard}>
        <Text variant="overline" color="tertiary">
          DATE
        </Text>
        <Text variant="bodyStrong" style={styles.dateValue}>
          {formatFullDate(date)}
        </Text>
      </Card>

      {submitError !== null ? <Banner tone="danger" message={submitError} /> : null}

      <View style={styles.fields}>
        <TextField
          label="Title"
          value={form.fields.title}
          onChangeText={value => form.setField('title', value)}
          error={errorFor('title')}
          maxLength={TITLE_MAX_LENGTH}
          autoCapitalize="sentences"
          returnKeyType="next"
          editable={!isSaving}
          placeholder="Enter event title here..."
        />

        <View style={styles.timeRow}>
          <TimeOfDayField
            label="Starts"
            containerStyle={styles.timeField}
            value={form.fields.start}
            onChange={value => form.setField('start', value)}
            error={errorFor('startMinutes')}
            disabled={isSaving}
          />
          <TimeOfDayField
            label="Ends"
            containerStyle={styles.timeField}
            value={form.fields.end}
            onChange={value => form.setField('end', value)}
            error={errorFor('endMinutes')}
            disabled={isSaving}
          />
        </View>

        <TextField
          label="Notes"
          value={form.fields.notes}
          onChangeText={value => form.setField('notes', value)}
          error={errorFor('notes')}
          hint="(optional)"
          maxLength={NOTES_MAX_LENGTH}
          multiline
          numberOfLines={4}
          editable={!isSaving}
          placeholder="Agenda, location, links…"
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={existing === null ? 'Create event' : 'Save changes'}
          onPress={() => {
            void handleSubmit();
          }}
          loading={isSaving}
        />
        {existing !== null ? (
          <Button
            label="Delete event"
            variant="ghost"
            onPress={handleDelete}
            disabled={isSaving}
            accessibilityHint="Removes this event from your calendar"
          />
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  missingText: {
    textAlign: 'center',
  },
  dateCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceSunken,
  },
  dateValue: {
    marginTop: spacing.xxs,
  },
  fields: {
    gap: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});
