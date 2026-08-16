import { parseCalendarDate } from './calendarDate';
import type { CalendarDate } from './calendarDate';
import {
  DAYS_PER_WEEK,
  WEEKS_PER_GRID,
  buildMonthGrid,
  weekdayOrder,
} from './monthGrid';

const flatten = (grid: ReturnType<typeof buildMonthGrid>): CalendarDate[] =>
  grid.weeks.flatMap(week => week.map(day => day.date));

const inMonthDates = (grid: ReturnType<typeof buildMonthGrid>): CalendarDate[] =>
  grid.weeks.flatMap(week => week.filter(day => day.isInMonth).map(day => day.date));

describe('buildMonthGrid', () => {
  it('always produces a 6x7 grid so the layout height never jumps', () => {
    for (const month of [1, 2, 6, 12]) {
      const grid = buildMonthGrid({ year: 2026, month });
      expect(grid.weeks).toHaveLength(WEEKS_PER_GRID);
      for (const week of grid.weeks) {
        expect(week).toHaveLength(DAYS_PER_WEEK);
      }
    }
  });

  it('produces consecutive days with no gaps or repeats', () => {
    const dates = flatten(buildMonthGrid({ year: 2026, month: 8 }));
    expect(new Set(dates).size).toBe(WEEKS_PER_GRID * DAYS_PER_WEEK);

    for (let index = 1; index < dates.length; index += 1) {
      const previous = dates[index - 1];
      const current = dates[index];
      expect(previous).toBeDefined();
      expect(current).toBeDefined();
      // Lexicographic ordering is meaningful for this encoding.
      expect(previous! < current!).toBe(true);
    }
  });

  it('starts on Monday when weekStart is 1', () => {
    // 1 August 2026 is a Saturday, so a Monday-start grid begins 27 July.
    const grid = buildMonthGrid({ year: 2026, month: 8 }, 1);
    expect(grid.weeks[0]?.[0]?.date).toBe('2026-07-27');
    expect(grid.weeks[0]?.[0]?.isInMonth).toBe(false);
  });

  it('starts on Sunday when weekStart is 0', () => {
    const grid = buildMonthGrid({ year: 2026, month: 8 }, 0);
    expect(grid.weeks[0]?.[0]?.date).toBe('2026-07-26');
  });

  it('needs no leading padding when the 1st falls on the week start', () => {
    // 1 June 2026 is a Monday.
    const grid = buildMonthGrid({ year: 2026, month: 6 }, 1);
    expect(grid.weeks[0]?.[0]?.date).toBe('2026-06-01');
    expect(grid.weeks[0]?.[0]?.isInMonth).toBe(true);
  });

  it('marks exactly the days belonging to the month', () => {
    expect(inMonthDates(buildMonthGrid({ year: 2026, month: 2 }))).toHaveLength(28);
    expect(inMonthDates(buildMonthGrid({ year: 2024, month: 2 }))).toHaveLength(29);
    expect(inMonthDates(buildMonthGrid({ year: 2026, month: 4 }))).toHaveLength(30);
    expect(inMonthDates(buildMonthGrid({ year: 2026, month: 8 }))).toHaveLength(31);
  });

  it('borrows only from the immediately adjacent months', () => {
    const grid = buildMonthGrid({ year: 2026, month: 8 }, 1);
    const outside = grid.weeks
      .flatMap(week => week.filter(day => !day.isInMonth))
      .map(day => day.date.slice(0, 7));
    expect(new Set(outside)).toEqual(new Set(['2026-07', '2026-09']));
  });

  it('spans a year boundary correctly', () => {
    const grid = buildMonthGrid({ year: 2026, month: 1 }, 1);
    // 1 January 2026 is a Thursday, so the grid opens on 29 December 2025.
    expect(grid.weeks[0]?.[0]?.date).toBe('2025-12-29');
    expect(inMonthDates(grid)).toHaveLength(31);
  });

  it('includes the leap day in February 2024', () => {
    expect(flatten(buildMonthGrid({ year: 2024, month: 2 }))).toContain(
      parseCalendarDate('2024-02-29'),
    );
  });
});

describe('weekdayOrder', () => {
  it('rotates to the configured week start', () => {
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
