import { toDateParts, todayCalendarDate } from './calendarDate';
import type { CalendarDate, YearMonth } from './calendarDate';
import { hoursOf, minutesOf } from './timeOfDay';
import type { TimeOfDay } from './timeOfDay';

/**
 * Every user-visible date or time string in the app is produced here, so
 * formatting decisions live in one place and components never assemble dates
 * by string concatenation.
 *
 * `locale` defaults to the device locale; tests pass an explicit one to stay
 * deterministic.
 */
export type Locale = string | undefined;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const formatter = (locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
  const key = `${locale ?? 'default'}|${JSON.stringify(options)}`;
  const cached = formatterCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const created = new Intl.DateTimeFormat(locale, options);
  formatterCache.set(key, created);
  return created;
};

/** Local-noon avoids any chance of a DST transition shifting the rendered day. */
const asDate = (date: CalendarDate): Date => {
  const { year, month, day } = toDateParts(date);
  return new Date(year, month - 1, day, 12);
};

export const formatMonthYear = ({ year, month }: YearMonth, locale?: Locale): string =>
  formatter(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1, 12));

/** "Saturday, 15 August 2026" — used for calendar cell accessibility labels. */
export const formatFullDate = (date: CalendarDate, locale?: Locale): string =>
  formatter(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(asDate(date));

/** "Sat, 15 August" — the selected-day heading above the agenda. */
export const formatDayHeading = (date: CalendarDate, locale?: Locale): string =>
  formatter(locale, { weekday: 'short', day: 'numeric', month: 'long' }).format(asDate(date));

/** Short weekday name for a 0-6 index, for the calendar's column headers. */
export const formatWeekdayShort = (weekday: number, locale?: Locale): string => {
  // 2024-01-07 was a Sunday, so adding the index lands on the wanted weekday.
  const reference = new Date(2024, 0, 7 + weekday, 12);
  return formatter(locale, { weekday: 'short' }).format(reference);
};

export const formatTime = (time: TimeOfDay, locale?: Locale): string =>
  formatter(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(2024, 0, 1, hoursOf(time), minutesOf(time)),
  );

export const formatTimeRange = (
  start: TimeOfDay,
  end: TimeOfDay,
  locale?: Locale,
): string => `${formatTime(start, locale)} – ${formatTime(end, locale)}`;

/** The `HH:MM` form used inside editable time inputs, deliberately locale-independent. */
export const formatTimeInput = (time: TimeOfDay): string =>
  `${String(hoursOf(time)).padStart(2, '0')}:${String(minutesOf(time)).padStart(2, '0')}`;

export const formatDuration = (start: TimeOfDay, end: TimeOfDay): string => {
  const total = end - start;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
};

/** "Today" / "Tomorrow" / "Yesterday" where applicable, otherwise null. */
export const relativeDayLabel = (date: CalendarDate, today = todayCalendarDate()): string | null => {
  if (date === today) {
    return 'Today';
  }
  const oneDay = 24 * 60 * 60 * 1000;
  const difference = Math.round((asDate(date).getTime() - asDate(today).getTime()) / oneDay);
  if (difference === 1) {
    return 'Tomorrow';
  }
  return difference === -1 ? 'Yesterday' : null;
};
