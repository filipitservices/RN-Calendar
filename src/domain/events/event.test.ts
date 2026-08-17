import { parseCalendarDate } from '../date/calendarDate';
import { timeOfDayFromParts } from '../date/timeOfDay';
import {
  NOTES_MAX_LENGTH,
  asEventId,
  compareEvents,
  conflictingEventIds,
  countEventsByDate,
  decodeCalendarEvent,
  eventsForDate,
  fieldsFromDraft,
} from './event';
import type { CalendarEvent } from './event';

const date = (value: string) => {
  const parsed = parseCalendarDate(value);
  if (parsed === null) {
    throw new Error(`Test fixture is not a valid date: ${value}`);
  }
  return parsed;
};

const event = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: asEventId('e1'),
  title: 'Team sync',
  notes: null,
  date: date('2026-08-15'),
  startMinutes: timeOfDayFromParts(9, 0),
  endMinutes: timeOfDayFromParts(10, 0),
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
  ...overrides,
});

describe('compareEvents', () => {
  it('orders by date first', () => {
    const earlier = event({ date: date('2026-08-14'), startMinutes: timeOfDayFromParts(23, 0) });
    const later = event({ date: date('2026-08-15'), startMinutes: timeOfDayFromParts(1, 0) });
    expect(compareEvents(earlier, later)).toBeLessThan(0);
  });

  it('orders by start time within a day', () => {
    const morning = event({ startMinutes: timeOfDayFromParts(9, 0) });
    const afternoon = event({ startMinutes: timeOfDayFromParts(14, 0) });
    expect(compareEvents(morning, afternoon)).toBeLessThan(0);
  });

  it('falls back to title so the order is stable for simultaneous events', () => {
    const a = event({ id: asEventId('a'), title: 'Alpha' });
    const b = event({ id: asEventId('b'), title: 'Beta' });
    expect(compareEvents(a, b)).toBeLessThan(0);
    expect(compareEvents(b, a)).toBeGreaterThan(0);
  });
});

describe('eventsForDate', () => {
  const events = [
    event({ id: asEventId('1'), date: date('2026-08-15'), startMinutes: timeOfDayFromParts(14, 0) }),
    event({ id: asEventId('2'), date: date('2026-08-16') }),
    event({ id: asEventId('3'), date: date('2026-08-15'), startMinutes: timeOfDayFromParts(8, 0) }),
  ];

  it('returns only the requested day, in chronological order, without mutating the input', () => {
    const original = [...events];
    expect(eventsForDate(events, date('2026-08-15')).map(e => e.id)).toEqual(['3', '1']);
    expect(events).toEqual(original);
  });
});

describe('countEventsByDate', () => {
  it('counts per day', () => {
    const counts = countEventsByDate([
      event({ id: asEventId('1'), date: date('2026-08-15') }),
      event({ id: asEventId('2'), date: date('2026-08-15') }),
      event({ id: asEventId('3'), date: date('2026-08-16') }),
    ]);
    expect(counts.get(date('2026-08-15'))).toBe(2);
    expect(counts.get(date('2026-08-16'))).toBe(1);
    expect(counts.get(date('2026-08-17'))).toBeUndefined();
  });
});

describe('conflictingEventIds', () => {
  it('tags a partial overlap on the same day', () => {
    const first = event({
      id: asEventId('a'),
      startMinutes: timeOfDayFromParts(9, 0),
      endMinutes: timeOfDayFromParts(11, 0),
    });
    const second = event({
      id: asEventId('b'),
      startMinutes: timeOfDayFromParts(10, 0),
      endMinutes: timeOfDayFromParts(12, 0),
    });
    expect([...conflictingEventIds([first, second])].sort()).toEqual(['a', 'b']);
  });

  it('does not tag intervals that only touch at an endpoint', () => {
    const first = event({
      id: asEventId('a'),
      startMinutes: timeOfDayFromParts(9, 0),
      endMinutes: timeOfDayFromParts(10, 0),
    });
    const second = event({
      id: asEventId('b'),
      startMinutes: timeOfDayFromParts(10, 0),
      endMinutes: timeOfDayFromParts(11, 0),
    });
    expect(conflictingEventIds([first, second]).size).toBe(0);
  });

  it('does not tag overlapping clock times on different days', () => {
    const monday = event({
      id: asEventId('mon'),
      date: date('2026-08-17'),
      startMinutes: timeOfDayFromParts(9, 0),
      endMinutes: timeOfDayFromParts(11, 0),
    });
    const tuesday = event({
      id: asEventId('tue'),
      date: date('2026-08-18'),
      startMinutes: timeOfDayFromParts(10, 0),
      endMinutes: timeOfDayFromParts(12, 0),
    });
    expect(conflictingEventIds([monday, tuesday]).size).toBe(0);
  });
});

describe('fieldsFromDraft', () => {
  it('trims the title and stores blank notes as null', () => {
    expect(
      fieldsFromDraft({
        title: '  Stand-up  ',
        notes: '   ',
        date: date('2026-08-15'),
        startMinutes: timeOfDayFromParts(9, 0),
        endMinutes: timeOfDayFromParts(10, 0),
      }),
    ).toEqual({
      title: 'Stand-up',
      notes: null,
      date: date('2026-08-15'),
      startMinutes: timeOfDayFromParts(9, 0),
      endMinutes: timeOfDayFromParts(10, 0),
    });
  });
});

describe('decodeCalendarEvent', () => {
  const raw = {
    id: 'e1',
    title: 'Team sync',
    notes: 'Weekly',
    date: '2026-08-15',
    startMinutes: 540,
    endMinutes: 600,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  };

  it('decodes a well-formed record', () => {
    const decoded = decodeCalendarEvent(raw);
    expect(decoded).not.toBeNull();
    expect(decoded?.date).toBe('2026-08-15');
    expect(decoded?.notes).toBe('Weekly');
  });

  it('normalises a missing notes field to null rather than undefined', () => {
    expect(decodeCalendarEvent({ ...raw, notes: undefined })?.notes).toBeNull();
  });

  it('treats blank notes as null', () => {
    expect(decodeCalendarEvent({ ...raw, notes: '   ' })?.notes).toBeNull();
  });

  it.each([
    ['a bad date', { date: '2026-02-30' }],
    ['a non-integer time', { startMinutes: 9.5 }],
    ['an out-of-range time', { endMinutes: 1440 }],
    ['an end before the start', { startMinutes: 600, endMinutes: 540 }],
    ['a missing id', { id: '' }],
    ['a non-string title', { title: 42 }],
    ['an empty title', { title: '   ' }],
    ['a title with markup', { title: '<script>' }],
    ['overlong notes', { notes: 'a'.repeat(NOTES_MAX_LENGTH + 1) }],
  ])('rejects %s instead of trusting it', (_label, override) => {
    expect(decodeCalendarEvent({ ...raw, ...override })).toBeNull();
  });

  it.each([null, undefined, 'string', 42, []])('rejects non-object %p', value => {
    expect(decodeCalendarEvent(value)).toBeNull();
  });
});
