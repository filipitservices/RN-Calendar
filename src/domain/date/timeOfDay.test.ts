import {
  MINUTES_PER_DAY,
  addMinutes,
  hoursOf,
  minutesOf,
  parseTimeInput,
  parseTimeOfDay,
  timeOfDayFromParts,
} from './timeOfDay';

describe('timeOfDayFromParts', () => {
  it('converts to minutes from midnight', () => {
    expect(timeOfDayFromParts(0, 0)).toBe(0);
    expect(timeOfDayFromParts(9, 30)).toBe(570);
    expect(timeOfDayFromParts(23, 59)).toBe(MINUTES_PER_DAY - 1);
  });

  it('rejects values outside a single day', () => {
    expect(() => timeOfDayFromParts(24, 0)).toThrow();
    expect(() => timeOfDayFromParts(-1, 0)).toThrow();
  });
});

describe('parseTimeInput', () => {
  it.each([
    ['09:30', 570],
    ['9:30', 570],
    ['00:00', 0],
    ['23:59', 1439],
    ['  10:15  ', 615],
  ])('parses %p', (input, expected) => {
    expect(parseTimeInput(input)).toBe(expected);
  });

  it.each(['24:00', '12:60', '9.30', '930', '', 'noon', '12:5', '1:2:3'])(
    'rejects %p',
    input => {
      expect(parseTimeInput(input)).toBeNull();
    },
  );
});

describe('parseTimeOfDay', () => {
  it.each([null, undefined, '570', 1440, -1, 9.5])('rejects untrusted %p', value => {
    expect(parseTimeOfDay(value)).toBeNull();
  });

  it('accepts an in-range integer', () => {
    expect(parseTimeOfDay(570)).toBe(570);
  });
});

describe('hoursOf and minutesOf', () => {
  it('decomposes back to clock parts', () => {
    const time = timeOfDayFromParts(14, 45);
    expect(hoursOf(time)).toBe(14);
    expect(minutesOf(time)).toBe(45);
  });
});

describe('addMinutes', () => {
  it('adds within the day', () => {
    expect(addMinutes(timeOfDayFromParts(9, 0), 90)).toBe(timeOfDayFromParts(10, 30));
  });

  it('clamps at the day boundaries rather than wrapping to another day', () => {
    expect(addMinutes(timeOfDayFromParts(23, 30), 120)).toBe(MINUTES_PER_DAY - 1);
    expect(addMinutes(timeOfDayFromParts(0, 10), -60)).toBe(0);
  });
});
