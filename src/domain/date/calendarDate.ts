/**
 * A civil date — a year/month/day with no instant and no timezone attached.
 *
 * Stored as `YYYY-MM-DD`. This is deliberately *not* a `Date`: a `Date` is an
 * instant, and converting between an instant and "the day the user tapped"
 * is where calendar apps acquire off-by-one-day bugs. Because the encoding is
 * fixed-width, two `CalendarDate`s compare with `===` and sort lexicographically.
 */
export type CalendarDate = string & { readonly __brand: 'CalendarDate' };

/** A year/month pair identifying a month in the grid. `month` is 1-12. */
export type YearMonth = {
  readonly year: number;
  readonly month: number;
};

export type DateParts = YearMonth & {
  readonly day: number;
};

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number, width: number): string => String(value).padStart(width, '0');

/** Days in a month, honouring the proleptic Gregorian leap rule. */
export const daysInMonth = ({ year, month }: YearMonth): number => {
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
};

const isValidParts = ({ year, month, day }: DateParts): boolean =>
  Number.isInteger(year) &&
  Number.isInteger(month) &&
  Number.isInteger(day) &&
  year >= 1 &&
  year <= 9999 &&
  month >= 1 &&
  month <= 12 &&
  day >= 1 &&
  day <= daysInMonth({ year, month });

/**
 * The only way to construct a `CalendarDate` from numbers. Throws on an
 * impossible date (30 February) because that is a programmer error, not a
 * user-facing failure.
 */
export const calendarDateFromParts = (parts: DateParts): CalendarDate => {
  if (!isValidParts(parts)) {
    throw new Error(
      `Invalid calendar date: ${parts.year}-${parts.month}-${parts.day}`,
    );
  }
  return `${pad(parts.year, 4)}-${pad(parts.month, 2)}-${pad(parts.day, 2)}` as CalendarDate;
};

/** Parses untrusted input (persisted JSON, route params). Returns null if malformed. */
export const parseCalendarDate = (value: unknown): CalendarDate | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const match = PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const parts: DateParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidParts(parts) ? (value as CalendarDate) : null;
};

export const toDateParts = (date: CalendarDate): DateParts => {
  const match = PATTERN.exec(date);
  if (match === null) {
    throw new Error(`Corrupt CalendarDate: ${date}`);
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

export const toYearMonth = (date: CalendarDate): YearMonth => {
  const { year, month } = toDateParts(date);
  return { year, month };
};

/**
 * The civil date in the device's local timezone. `now` is injectable so tests
 * never depend on the wall clock.
 */
export const todayCalendarDate = (now: Date = new Date()): CalendarDate =>
  calendarDateFromParts({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });

/**
 * Converts to a local-midnight `Date`, used only for weekday arithmetic inside
 * this module. Note this uses the numeric constructor, never `new Date(string)`,
 * which would parse as UTC and shift the day in negative-offset timezones.
 */
const toLocalDate = (date: CalendarDate): Date => {
  const { year, month, day } = toDateParts(date);
  return new Date(year, month - 1, day);
};

const fromLocalDate = (value: Date): CalendarDate =>
  calendarDateFromParts({
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
  });

/** 0 = Sunday … 6 = Saturday. */
export const dayOfWeek = (date: CalendarDate): number => toLocalDate(date).getDay();

export const addDays = (date: CalendarDate, amount: number): CalendarDate => {
  const shifted = toLocalDate(date);
  shifted.setDate(shifted.getDate() + amount);
  return fromLocalDate(shifted);
};

/**
 * Month arithmetic that clamps rather than overflows. `Date.setMonth` turns
 * 31 January + 1 month into 3 March; here it becomes 28/29 February.
 */
export const addMonths = (yearMonth: YearMonth, amount: number): YearMonth => {
  const zeroBased = yearMonth.year * 12 + (yearMonth.month - 1) + amount;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
};

export const isSameYearMonth = (a: YearMonth, b: YearMonth): boolean =>
  a.year === b.year && a.month === b.month;

/** Negative if `a` is earlier. Safe because the encoding is fixed-width. */
export const compareCalendarDates = (a: CalendarDate, b: CalendarDate): number =>
  a < b ? -1 : a > b ? 1 : 0;
