import { parseCalendarDate } from '../date/calendarDate';
import { timeOfDayFromParts } from '../date/timeOfDay';
import {
  asEventId,
  compareEvents,
  countEventsByDate,
  decodeCalendarEvent,
  eventsForDate,
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

  it('returns only the requested day, in chronological order', () => {
    expect(eventsForDate(events, date('2026-08-15')).map(e => e.id)).toEqual(['3', '1']);
  });

  it('returns an empty list for a free day', () => {
    expect(eventsForDate(events, date('2026-08-17'))).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const original = [...events];
    eventsForDate(events, date('2026-08-15'));
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

  it.each([
    ['a bad date', { date: '2026-02-30' }],
    ['a non-integer time', { startMinutes: 9.5 }],
    ['an out-of-range time', { endMinutes: 1440 }],
    ['an end before the start', { startMinutes: 600, endMinutes: 540 }],
    ['a missing id', { id: '' }],
    ['a non-string title', { title: 42 }],
  ])('rejects %s instead of trusting it', (_label, override) => {
    expect(decodeCalendarEvent({ ...raw, ...override })).toBeNull();
  });

  it.each([null, undefined, 'string', 42, []])('rejects non-object %p', value => {
    expect(decodeCalendarEvent(value)).toBeNull();
  });
});
