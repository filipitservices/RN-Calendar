import {
  addDays,
  addMonths,
  addMonthsToDate,
  calendarDateFromParts,
  compareCalendarDates,
  dayOfWeek,
  daysInMonth,
  parseCalendarDate,
  toDateParts,
  todayCalendarDate,
} from './calendarDate';
import type { CalendarDate } from './calendarDate';

const date = (value: string) => {
  const parsed = parseCalendarDate(value);
  if (parsed === null) {
    throw new Error(`Test fixture is not a valid date: ${value}`);
  }
  return parsed;
};

describe('calendarDateFromParts', () => {
  it('zero-pads to a fixed-width encoding', () => {
    expect(calendarDateFromParts({ year: 2026, month: 3, day: 7 })).toBe('2026-03-07');
  });

  it('rejects days that do not exist in the month', () => {
    expect(() => calendarDateFromParts({ year: 2026, month: 2, day: 29 })).toThrow();
    expect(() => calendarDateFromParts({ year: 2026, month: 4, day: 31 })).toThrow();
  });

  it('accepts 29 February in a leap year', () => {
    expect(calendarDateFromParts({ year: 2024, month: 2, day: 29 })).toBe('2024-02-29');
  });
});

describe('parseCalendarDate', () => {
  it.each(['2026-13-01', '2026-00-10', '2026-02-30', '26-01-01', '2026-1-1', '', 'not a date'])(
    'rejects %p',
    value => {
      expect(parseCalendarDate(value)).toBeNull();
    },
  );

  it.each([null, undefined, 42, {}, []])('rejects non-string %p', value => {
    expect(parseCalendarDate(value)).toBeNull();
  });

  it('round-trips a valid date through its parts', () => {
    const parsed = date('2026-08-15');
    expect(toDateParts(parsed)).toEqual({ year: 2026, month: 8, day: 15 });
  });
});

describe('daysInMonth', () => {
  it('applies the Gregorian leap rule', () => {
    expect(daysInMonth({ year: 2024, month: 2 })).toBe(29); // divisible by 4
    expect(daysInMonth({ year: 1900, month: 2 })).toBe(28); // century, not by 400
    expect(daysInMonth({ year: 2000, month: 2 })).toBe(29); // divisible by 400
    expect(daysInMonth({ year: 2026, month: 2 })).toBe(28);
  });

  it('knows the 30-day months', () => {
    expect(daysInMonth({ year: 2026, month: 4 })).toBe(30);
    expect(daysInMonth({ year: 2026, month: 12 })).toBe(31);
  });
});

describe('todayCalendarDate', () => {
  it('uses local calendar fields, not the UTC instant', () => {
    // 22:30 local on 15 August. In any timezone east of UTC this instant is
    // already 16 August in UTC, so a UTC-based implementation would be wrong.
    const localLateEvening = new Date(2026, 7, 15, 22, 30);
    expect(todayCalendarDate(localLateEvening)).toBe('2026-08-15');
  });

  it('handles just after local midnight', () => {
    expect(todayCalendarDate(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
  });
});

describe('addDays', () => {
  it('crosses month boundaries', () => {
    expect(addDays(date('2026-01-31'), 1)).toBe('2026-02-01');
  });

  it('crosses year boundaries in both directions', () => {
    expect(addDays(date('2026-12-31'), 1)).toBe('2027-01-01');
    expect(addDays(date('2026-01-01'), -1)).toBe('2025-12-31');
  });

  it('crosses a leap day', () => {
    expect(addDays(date('2024-02-28'), 1)).toBe('2024-02-29');
    expect(addDays(date('2024-02-29'), 1)).toBe('2024-03-01');
  });

  it('is reversible', () => {
    expect(addDays(addDays(date('2026-03-15'), 45), -45)).toBe('2026-03-15');
  });
});

describe('addMonths', () => {
  it('rolls over the year', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('handles multi-year jumps', () => {
    expect(addMonths({ year: 2026, month: 6 }, 25)).toEqual({ year: 2028, month: 7 });
    expect(addMonths({ year: 2026, month: 6 }, -25)).toEqual({ year: 2024, month: 5 });
  });
});

describe('addMonthsToDate', () => {
  it('clamps instead of overflowing', () => {
    // Date.prototype.setMonth would produce 3 March here.
    expect(addMonthsToDate(date('2026-01-31'), 1)).toBe('2026-02-28');
    expect(addMonthsToDate(date('2024-01-31'), 1)).toBe('2024-02-29');
    expect(addMonthsToDate(date('2026-03-31'), -1)).toBe('2026-02-28');
  });

  it('keeps the day when the target month is long enough', () => {
    expect(addMonthsToDate(date('2026-01-15'), 1)).toBe('2026-02-15');
  });
});

describe('dayOfWeek', () => {
  it('returns 0 for Sunday through 6 for Saturday', () => {
    expect(dayOfWeek(date('2026-08-16'))).toBe(0); // Sunday
    expect(dayOfWeek(date('2026-08-17'))).toBe(1); // Monday
    expect(dayOfWeek(date('2026-08-15'))).toBe(6); // Saturday
  });
});

describe('compareCalendarDates', () => {
  it('orders chronologically', () => {
    expect(compareCalendarDates(date('2026-01-01'), date('2026-01-02'))).toBeLessThan(0);
    expect(compareCalendarDates(date('2026-02-01'), date('2026-01-31'))).toBeGreaterThan(0);
    expect(compareCalendarDates(date('2026-01-01'), date('2026-01-01'))).toBe(0);
  });

  it('sorts across years without converting to Date', () => {
    const dates: CalendarDate[] = [
      date('2027-01-01'),
      date('2026-12-31'),
      date('2026-02-09'),
      date('2026-02-10'),
    ];
    expect([...dates].sort(compareCalendarDates)).toEqual([
      '2026-02-09',
      '2026-02-10',
      '2026-12-31',
      '2027-01-01',
    ]);
  });
});
