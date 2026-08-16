import { useCallback, useMemo, useReducer } from 'react';

import {
  addDays,
  addMonths,
  toYearMonth,
  todayCalendarDate,
} from '../../domain/date/calendarDate';
import type { CalendarDate, YearMonth } from '../../domain/date/calendarDate';
import { buildMonthGrid } from '../../domain/date/monthGrid';
import type { WeekStart } from '../../domain/date/monthGrid';

/**
 * `selected` and `visibleMonth` are both state because they move independently:
 * paging through months should not change the selection, and selecting a
 * borrowed day from an adjacent month should page the grid. Deriving one from
 * the other would make one of those interactions impossible.
 */
type CalendarState = {
  readonly selected: CalendarDate;
  readonly visibleMonth: YearMonth;
};

type CalendarAction =
  | { type: 'selectDate'; date: CalendarDate }
  | { type: 'shiftMonth'; amount: number }
  | { type: 'shiftDay'; amount: number }
  | { type: 'goToToday'; today: CalendarDate };

const reducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'selectDate':
      // Follow the selection into its month so a tap on a leading/trailing
      // day brings that month into view.
      return { selected: action.date, visibleMonth: toYearMonth(action.date) };

    case 'shiftMonth': {
      const visibleMonth = addMonths(state.visibleMonth, action.amount);
      return { ...state, visibleMonth };
    }

    case 'shiftDay': {
      const selected = addDays(state.selected, action.amount);
      return { selected, visibleMonth: toYearMonth(selected) };
    }

    case 'goToToday':
      return { selected: action.today, visibleMonth: toYearMonth(action.today) };
  }
};

export type CalendarController = {
  readonly selected: CalendarDate;
  readonly visibleMonth: YearMonth;
  readonly today: CalendarDate;
  readonly grid: ReturnType<typeof buildMonthGrid>;
  selectDate: (date: CalendarDate) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
};

export type UseCalendarOptions = {
  weekStart?: WeekStart;
  /** Injectable for deterministic tests; defaults to the device's civil date. */
  today?: CalendarDate;
};

export const useCalendar = ({
  weekStart = 1,
  today = todayCalendarDate(),
}: UseCalendarOptions = {}): CalendarController => {
  const [state, dispatch] = useReducer(reducer, today, initial => ({
    selected: initial,
    visibleMonth: toYearMonth(initial),
  }));

  const grid = useMemo(
    () => buildMonthGrid(state.visibleMonth, weekStart),
    [state.visibleMonth, weekStart],
  );

  const selectDate = useCallback(
    (date: CalendarDate) => dispatch({ type: 'selectDate', date }),
    [],
  );

  const shiftMonth = useCallback(
    (amount: number) => dispatch({ type: 'shiftMonth', amount }),
    [],
  );

  return {
    selected: state.selected,
    visibleMonth: state.visibleMonth,
    today,
    grid,
    selectDate,
    goToPreviousMonth: useCallback(() => shiftMonth(-1), [shiftMonth]),
    goToNextMonth: useCallback(() => shiftMonth(1), [shiftMonth]),
    goToPreviousDay: useCallback(() => dispatch({ type: 'shiftDay', amount: -1 }), []),
    goToNextDay: useCallback(() => dispatch({ type: 'shiftDay', amount: 1 }), []),
    goToToday: useCallback(() => dispatch({ type: 'goToToday', today }), [today]),
  };
};
