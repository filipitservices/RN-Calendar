import { useMemo, useState } from 'react';

import type { CalendarDate } from '../../domain/date/calendarDate';
import { formatTimeInput } from '../../domain/date/format';
import { parseTimeInput, timeOfDayFromParts } from '../../domain/date/timeOfDay';
import type { CalendarEvent, EventDraft } from '../../domain/events/event';
import { hasErrors, validateEventDraft } from '../../domain/events/validation';
import type { EventFieldErrors } from '../../domain/events/validation';

const DEFAULT_START = timeOfDayFromParts(9, 0);
const DEFAULT_END = timeOfDayFromParts(10, 0);

/** Text fields are the source of truth while editing so partial input survives. */
export type EventFormFields = {
  title: string;
  notes: string;
  start: string;
  end: string;
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
      start: formatTimeInput(DEFAULT_START),
      end: formatTimeInput(DEFAULT_END),
    };
  }
  return {
    title: event.title,
    notes: event.notes ?? '',
    start: formatTimeInput(event.startMinutes),
    end: formatTimeInput(event.endMinutes),
  };
};

/**
 * Shared form logic for creating and editing an event — the same domain
 * operation, so there is one implementation rather than two.
 *
 * `date` is fixed for the lifetime of the form: create uses the day selected in
 * the calendar, edit uses the event's existing day.
 */
export const useEventForm = (date: CalendarDate, event: CalendarEvent | null): EventFormState => {
  const [fields, setFields] = useState<EventFormFields>(() => initialFields(event));
  const [showErrors, setShowErrors] = useState(false);

  const parsed = useMemo(
    () => ({
      start: parseTimeInput(fields.start),
      end: parseTimeInput(fields.end),
    }),
    [fields.start, fields.end],
  );

  const errors = useMemo<EventFieldErrors>(() => {
    // Unparseable time text is a form-level concern; the domain validator only
    // sees well-formed times, so it can stay free of string parsing.
    const timeErrors: { startMinutes?: string; endMinutes?: string } = {};
    if (parsed.start === null) {
      timeErrors.startMinutes = 'Use 24-hour HH:MM, for example 09:30.';
    }
    if (parsed.end === null) {
      timeErrors.endMinutes = 'Use 24-hour HH:MM, for example 10:30.';
    }

    if (parsed.start === null || parsed.end === null) {
      // The time text is unusable, so only the non-time fields are validated;
      // substituting the defaults keeps the draft well-typed without inventing
      // a time comparison the user did not express.
      const draftErrors = validateEventDraft({
        title: fields.title,
        notes: fields.notes,
        date,
        startMinutes: parsed.start ?? DEFAULT_START,
        endMinutes: parsed.end ?? DEFAULT_END,
      });
      return { title: draftErrors.title, notes: draftErrors.notes, ...timeErrors };
    }

    return validateEventDraft({
      title: fields.title,
      notes: fields.notes,
      date,
      startMinutes: parsed.start,
      endMinutes: parsed.end,
    });
  }, [fields.title, fields.notes, date, parsed]);

  const setField = <K extends keyof EventFormFields>(key: K, value: EventFormFields[K]) => {
    setFields(current => ({ ...current, [key]: value }));
  };

  const submit = (): EventDraft | null => {
    setShowErrors(true);
    if (hasErrors(errors) || parsed.start === null || parsed.end === null) {
      return null;
    }
    return {
      title: fields.title,
      notes: fields.notes,
      date,
      startMinutes: parsed.start,
      endMinutes: parsed.end,
    };
  };

  return { fields, errors, showErrors, setField, submit };
};
