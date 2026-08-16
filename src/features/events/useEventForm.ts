import { useMemo, useState } from 'react';

import type { CalendarDate } from '../../domain/date/calendarDate';
import { timeOfDayFromParts } from '../../domain/date/timeOfDay';
import type { TimeOfDay } from '../../domain/date/timeOfDay';
import type { CalendarEvent, EventDraft } from '../../domain/events/event';
import { hasErrors, validateEventDraft } from '../../domain/events/validation';
import type { EventFieldErrors } from '../../domain/events/validation';

const DEFAULT_START = timeOfDayFromParts(9, 0);
const DEFAULT_END = timeOfDayFromParts(10, 0);

export type EventFormFields = {
  title: string;
  notes: string;
  start: TimeOfDay;
  end: TimeOfDay;
};

export type EventFormState = {
  fields: EventFormFields;
  errors: EventFieldErrors;
  /** Errors are withheld until the first submit attempt. */
  showErrors: boolean;
  setField: <K extends keyof EventFormFields>(key: K, value: EventFormFields[K]) => void;
  /** Returns a valid draft, or null after flagging the errors for display. */
  submit: () => EventDraft | null;
};

const initialFields = (event: CalendarEvent | null): EventFormFields => {
  if (event === null) {
    return {
      title: '',
      notes: '',
      start: DEFAULT_START,
      end: DEFAULT_END,
    };
  }
  return {
    title: event.title,
    notes: event.notes ?? '',
    start: event.startMinutes,
    end: event.endMinutes,
  };
};

/**
 * Shared form logic for creating and editing an event — the same domain
 * operation, so there is one implementation rather than two.
 *
 * `date` is fixed for the lifetime of the form: create uses the day selected in
 * the calendar, edit uses the event's existing day. Clock times are always
 * valid `TimeOfDay` values; only title, notes, and end-after-start remain.
 */
export const useEventForm = (date: CalendarDate, event: CalendarEvent | null): EventFormState => {
  const [fields, setFields] = useState<EventFormFields>(() => initialFields(event));
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo<EventFieldErrors>(
    () =>
      validateEventDraft({
        title: fields.title,
        notes: fields.notes,
        date,
        startMinutes: fields.start,
        endMinutes: fields.end,
      }),
    [fields.title, fields.notes, fields.start, fields.end, date],
  );

  const setField = <K extends keyof EventFormFields>(key: K, value: EventFormFields[K]) => {
    setFields(current => ({ ...current, [key]: value }));
  };

  const submit = (): EventDraft | null => {
    setShowErrors(true);
    if (hasErrors(errors)) {
      return null;
    }
    return {
      title: fields.title,
      notes: fields.notes,
      date,
      startMinutes: fields.start,
      endMinutes: fields.end,
    };
  };

  return { fields, errors, showErrors, setField, submit };
};
