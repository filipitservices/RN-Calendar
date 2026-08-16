import { fireEvent, render, screen } from '@testing-library/react-native';

import { parseCalendarDate } from '../../../domain/date/calendarDate';
import type { CalendarDate } from '../../../domain/date/calendarDate';
import { formatFullDate } from '../../../domain/date/format';
import { buildMonthGrid } from '../../../domain/date/monthGrid';
import { AppearanceProvider } from '../../../app/AppearanceProvider';
import { MonthGrid } from './MonthGrid';

const date = (value: string) => {
  const parsed = parseCalendarDate(value);
  if (parsed === null) {
    throw new Error(`Test fixture is not a valid date: ${value}`);
  }
  return parsed;
};

const cell = (value: string) => screen.getByLabelText(formatFullDate(date(value)));

const renderGrid = async (
  options: {
    selected?: CalendarDate;
    counts?: ReadonlyMap<CalendarDate, number>;
  } = {},
) => {
  const onSelectDate = jest.fn();
  await render(
    <AppearanceProvider>
      <MonthGrid
        grid={buildMonthGrid({ year: 2026, month: 8 }, 1)}
        selected={options.selected ?? date('2026-08-15')}
        today={date('2026-08-15')}
        eventCounts={options.counts ?? new Map()}
        onSelectDate={onSelectDate}
      />
    </AppearanceProvider>,
  );
  return { onSelectDate };
};

describe('MonthGrid', () => {
  it('reports the civil date when a day is pressed, including a borrowed day', async () => {
    const { onSelectDate } = await renderGrid();

    await fireEvent.press(cell('2026-08-12'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-08-12');

    await fireEvent.press(cell('2026-09-01'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-09-01');
  });

  it('marks the selected day with accessibility state', async () => {
    await renderGrid({ selected: date('2026-08-20') });

    expect(cell('2026-08-20')).toBeSelected();
    expect(cell('2026-08-15')).not.toBeSelected();
  });

  it('announces the event count for a day', async () => {
    await renderGrid({ counts: new Map([[date('2026-08-18'), 3]]) });

    expect(cell('2026-08-18')).toHaveProp('accessibilityHint', '3 events');
    expect(cell('2026-08-19')).toHaveProp('accessibilityHint', 'No events');
  });
});
