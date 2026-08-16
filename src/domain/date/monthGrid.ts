import {
  addDays,
  calendarDateFromParts,
  dayOfWeek,
  isSameYearMonth,
  toYearMonth,
} from './calendarDate';
import type { CalendarDate, YearMonth } from './calendarDate';

/** 0 = Sunday … 6 = Saturday. */
export type WeekStart = 0 | 1;

export const DAYS_PER_WEEK = 7;

/**
 * Six rows always. A fixed row count keeps the grid's height stable across
 * months, so switching months never makes the layout jump.
 */
export const WEEKS_PER_GRID = 6;

export type MonthGridDay = {
  readonly date: CalendarDate;
  /** False for the leading/trailing days borrowed from adjacent months. */
  readonly isInMonth: boolean;
};

export type MonthGrid = {
  readonly yearMonth: YearMonth;
  readonly weekStart: WeekStart;
  /** Exactly `WEEKS_PER_GRID` rows of `DAYS_PER_WEEK` days. */
  readonly weeks: readonly (readonly MonthGridDay[])[];
};

/**
 * Builds the calendar grid for a month.
 *
 * The grid always starts on `weekStart` and always contains 42 cells, padded
 * with days from the neighbouring months so every row is full. Everything is
 * derived by counting days forward from a single anchor, so there is no
 * per-cell date construction that could disagree about month boundaries.
 */
export const buildMonthGrid = (yearMonth: YearMonth, weekStart: WeekStart = 1): MonthGrid => {
  const firstOfMonth = calendarDateFromParts({ ...yearMonth, day: 1 });

  // How many trailing days of the previous month precede the 1st.
  const leadingDays = (dayOfWeek(firstOfMonth) - weekStart + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const gridStart = addDays(firstOfMonth, -leadingDays);

  const weeks: MonthGridDay[][] = [];
  for (let week = 0; week < WEEKS_PER_GRID; week += 1) {
    const row: MonthGridDay[] = [];
    for (let weekday = 0; weekday < DAYS_PER_WEEK; weekday += 1) {
      const date = addDays(gridStart, week * DAYS_PER_WEEK + weekday);
      row.push({ date, isInMonth: isSameYearMonth(toYearMonth(date), yearMonth) });
    }
    weeks.push(row);
  }

  return { yearMonth, weekStart, weeks };
};

/**
 * Weekday indices in display order, e.g. `[1,2,3,4,5,6,0]` for a Monday start.
 * Used to label the header without duplicating the rotation logic.
 */
export const weekdayOrder = (weekStart: WeekStart): readonly number[] =>
  Array.from({ length: DAYS_PER_WEEK }, (_, index) => (weekStart + index) % DAYS_PER_WEEK);
