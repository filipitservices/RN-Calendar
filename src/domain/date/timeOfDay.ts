/**
 * Minutes elapsed since local midnight, 0-1439.
 *
 * Event times are stored this way rather than as instants so that an event
 * can never drift onto a neighbouring day when the device timezone or DST
 * offset changes. The day is carried by `CalendarDate`; this carries only the
 * clock reading.
 */
export type TimeOfDay = number & { readonly __brand: 'TimeOfDay' };

export const MINUTES_PER_DAY = 24 * 60;

export const isTimeOfDay = (value: unknown): value is TimeOfDay =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value < MINUTES_PER_DAY;

export const timeOfDayFromParts = (hours: number, minutes: number): TimeOfDay => {
  const total = hours * 60 + minutes;
  if (!isTimeOfDay(total)) {
    throw new Error(`Invalid time of day: ${hours}:${minutes}`);
  }
  return total;
};

/** Parses untrusted input. Returns null rather than throwing. */
export const parseTimeOfDay = (value: unknown): TimeOfDay | null =>
  isTimeOfDay(value) ? value : null;

/**
 * Parses user text in `HH:MM` (24-hour) form. Returns null for anything else,
 * which the form layer turns into a validation message.
 */
export const parseTimeInput = (input: string): TimeOfDay | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (match === null) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return timeOfDayFromParts(hours, minutes);
};

export const hoursOf = (time: TimeOfDay): number => Math.floor(time / 60);

export const minutesOf = (time: TimeOfDay): number => time % 60;

/** Clamps into the same day; used when nudging an end time after a start time. */
export const addMinutes = (time: TimeOfDay, amount: number): TimeOfDay => {
  const total = Math.min(Math.max(time + amount, 0), MINUTES_PER_DAY - 1);
  return total as TimeOfDay;
};
