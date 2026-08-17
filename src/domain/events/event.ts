import { compareCalendarDates, parseCalendarDate } from '../date/calendarDate';
import type { CalendarDate } from '../date/calendarDate';
import { parseTimeOfDay } from '../date/timeOfDay';
import type { TimeOfDay } from '../date/timeOfDay';

export type EventId = string & { readonly __brand: 'EventId' };

export const asEventId = (value: string): EventId => value as EventId;

export const TITLE_MAX_LENGTH = 80;
export const NOTES_MAX_LENGTH = 500;

/** Letters, marks, numbers, spaces, and ordinary punctuation — not emoji, markup, or control characters. */
const TITLE_CHAR_PATTERN = /^[\p{L}\p{M}\p{N} .,'!?()\-&/:]+$/u;

export const isAllowedEventTitle = (title: string): boolean =>
  TITLE_CHAR_PATTERN.test(title) && /[\p{L}\p{N}]/u.test(title);

export const isAllowedEventNotes = (notes: string): boolean => {
  for (let index = 0; index < notes.length; index += 1) {
    const code = notes.charCodeAt(index);
    if (code === 127 || (code < 32 && code !== 9 && code !== 10)) {
      return false;
    }
  }
  return true;
};

/**
 * A meeting on a single civil day.
 *
 * Placement is `date` + `startMinutes`/`endMinutes` rather than a pair of
 * instants, so an event cannot render on the wrong day. `createdAt`/`updatedAt`
 * are true instants but are audit metadata only — never use them for placement.
 *
 * The shape is intentionally small. Extra fields (location, attendees,
 * recurrence, reminders) can be added without touching placement or storage.
 */
export type CalendarEvent = {
  readonly id: EventId;
  readonly title: string;
  readonly notes: string | null;
  readonly date: CalendarDate;
  readonly startMinutes: TimeOfDay;
  readonly endMinutes: TimeOfDay;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** The user-supplied part of an event — what a form produces, shared by create and edit. */
export type EventDraft = {
  readonly title: string;
  readonly notes: string;
  readonly date: CalendarDate;
  readonly startMinutes: TimeOfDay;
  readonly endMinutes: TimeOfDay;
};

/** Persistence fields derived from a draft: trimmed title, empty notes stored as null. */
export const fieldsFromDraft = (draft: EventDraft) => {
  const notes = draft.notes.trim();
  return {
    title: draft.title.trim(),
    notes: notes.length > 0 ? notes : null,
    date: draft.date,
    startMinutes: draft.startMinutes,
    endMinutes: draft.endMinutes,
  };
};

/** Chronological within a day. Same start time falls back to title for a stable order. */
export const compareEvents = (a: CalendarEvent, b: CalendarEvent): number => {
  const byDate = compareCalendarDates(a.date, b.date);
  if (byDate !== 0) {
    return byDate;
  }
  if (a.startMinutes !== b.startMinutes) {
    return a.startMinutes - b.startMinutes;
  }
  return a.title.localeCompare(b.title);
};

export const eventsForDate = (
  events: readonly CalendarEvent[],
  date: CalendarDate,
): CalendarEvent[] => events.filter(event => event.date === date).sort(compareEvents);

/** Event counts keyed by date, for the density dots under calendar day cells. */
export const countEventsByDate = (
  events: readonly CalendarEvent[],
): ReadonlyMap<CalendarDate, number> => {
  const counts = new Map<CalendarDate, number>();
  for (const event of events) {
    counts.set(event.date, (counts.get(event.date) ?? 0) + 1);
  }
  return counts;
};

/**
 * Half-open intervals on the same civil day. Adjacent times (09:00–10:00 and
 * 10:00–11:00) do not conflict; a genuine overlap does.
 */
export const eventsOverlap = (a: CalendarEvent, b: CalendarEvent): boolean =>
  a.date === b.date && a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;

/** Derived from the live list — never stored on the event. */
export const conflictingEventIds = (events: readonly CalendarEvent[]): ReadonlySet<EventId> => {
  const ids = new Set<EventId>();
  for (let index = 0; index < events.length; index += 1) {
    const current = events[index];
    if (current === undefined) {
      continue;
    }
    for (let otherIndex = index + 1; otherIndex < events.length; otherIndex += 1) {
      const other = events[otherIndex];
      if (other !== undefined && eventsOverlap(current, other)) {
        ids.add(current.id);
        ids.add(other.id);
      }
    }
  }
  return ids;
};

/**
 * Decodes one record from persisted JSON. Returns null for anything malformed
 * so a single corrupt record cannot crash the app or be silently trusted.
 */
export const decodeCalendarEvent = (value: unknown): CalendarEvent | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;

  const date = parseCalendarDate(record.date);
  const startMinutes = parseTimeOfDay(record.startMinutes);
  const endMinutes = parseTimeOfDay(record.endMinutes);

  if (
    typeof record.id !== 'string' ||
    record.id.length === 0 ||
    typeof record.title !== 'string' ||
    typeof record.createdAt !== 'string' ||
    typeof record.updatedAt !== 'string' ||
    date === null ||
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes
  ) {
    return null;
  }

  const title = record.title.trim();
  if (
    title.length === 0 ||
    title.length > TITLE_MAX_LENGTH ||
    !isAllowedEventTitle(title)
  ) {
    return null;
  }

  let notes: string | null = null;
  if (typeof record.notes === 'string') {
    const trimmedNotes = record.notes.trim();
    if (trimmedNotes.length > NOTES_MAX_LENGTH || !isAllowedEventNotes(trimmedNotes)) {
      return null;
    }
    notes = trimmedNotes.length > 0 ? trimmedNotes : null;
  }

  return {
    id: asEventId(record.id),
    title,
    notes,
    date,
    startMinutes,
    endMinutes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};
