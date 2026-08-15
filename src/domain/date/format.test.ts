import { parseCalendarDate } from './calendarDate';
import {
  formatDayHeading,
  formatDuration,
  formatFullDate,
  formatMonthYear,
  formatTimeInput,
  formatTimeRange,
  relativeDayLabel,
} from './format';
import { timeOfDayFromParts } from './timeOfDay';

const date = (value: string) => {
  const parsed = parseCalendarDate(value);
  if (parsed === null) {
    throw new Error(`Test fixture is not a valid date: ${value}`);
  }
  return parsed;
};

// An explicit locale keeps these assertions independent of the host machine.
const LOCALE = 'en-GB';

describe('formatMonthYear', () => {
  it('renders the month name and year', () => {
    expect(formatMonthYear({ year: 2026, month: 8 }, LOCALE)).toBe('August 2026');
    expect(formatMonthYear({ year: 2026, month: 1 }, LOCALE)).toBe('January 2026');
  });
});

describe('formatFullDate', () => {
  it('renders the weekday for the correct day', () => {
    // Guards against a UTC-parsing regression, which would shift this to Friday.
    expect(formatFullDate(date('2026-08-15'), LOCALE)).toBe('Saturday, 15 August 2026');
  });

  it('is correct on the first of a month', () => {
    expect(formatFullDate(date('2026-03-01'), LOCALE)).toBe('Sunday, 1 March 2026');
  });

  it('is correct on a leap day', () => {
    expect(formatFullDate(date('2024-02-29'), LOCALE)).toBe('Thursday, 29 February 2024');
  });
});

describe('formatDayHeading', () => {
  it('omits the year', () => {
    expect(formatDayHeading(date('2026-08-15'), LOCALE)).toBe('Sat 15 August');
  });
});

describe('formatTimeInput', () => {
  it('always pads to HH:MM regardless of locale', () => {
    expect(formatTimeInput(timeOfDayFromParts(9, 5))).toBe('09:05');
    expect(formatTimeInput(timeOfDayFromParts(23, 59))).toBe('23:59');
    expect(formatTimeInput(timeOfDayFromParts(0, 0))).toBe('00:00');
  });
});

describe('formatTimeRange', () => {
  it('joins start and end', () => {
    const range = formatTimeRange(
      timeOfDayFromParts(9, 0),
      timeOfDayFromParts(10, 30),
      LOCALE,
    );
    expect(range).toBe('09:00 – 10:30');
  });
});

describe('formatDuration', () => {
  it.each([
    [timeOfDayFromParts(9, 0), timeOfDayFromParts(9, 30), '30 min'],
    [timeOfDayFromParts(9, 0), timeOfDayFromParts(10, 0), '1 h'],
    [timeOfDayFromParts(9, 0), timeOfDayFromParts(11, 15), '2 h 15 min'],
  ])('describes the gap', (start, end, expected) => {
    expect(formatDuration(start, end)).toBe(expected);
  });
});

describe('relativeDayLabel', () => {
  const today = date('2026-08-15');

  it('labels the neighbouring days', () => {
    expect(relativeDayLabel(today, today)).toBe('Today');
    expect(relativeDayLabel(date('2026-08-16'), today)).toBe('Tomorrow');
    expect(relativeDayLabel(date('2026-08-14'), today)).toBe('Yesterday');
  });

  it('returns null for anything further away', () => {
    expect(relativeDayLabel(date('2026-08-17'), today)).toBeNull();
    expect(relativeDayLabel(date('2026-08-13'), today)).toBeNull();
  });

  it('works across a month boundary', () => {
    expect(relativeDayLabel(date('2026-09-01'), date('2026-08-31'))).toBe('Tomorrow');
    expect(relativeDayLabel(date('2026-07-31'), date('2026-08-01'))).toBe('Yesterday');
  });
});
