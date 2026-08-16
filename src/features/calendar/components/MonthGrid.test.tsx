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

/**
 * Cells are looked up through the app's own formatter, so these tests assert
 * that the right *date* is labelled rather than pinning a locale's wording —
 * the exact formatting is covered in `format.test.ts`.
 */
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
  it('renders a labelled cell for every day of the month', async () => {
    await renderGrid();
    expect(cell('2026-08-01')).toBeOnTheScreen();
    expect(cell('2026-08-15')).toBeOnTheScreen();
    expect(cell('2026-08-31')).toBeOnTheScreen();
  });

  it('shows the borrowed days from the adjacent months', async () => {
    await renderGrid();
    // 1 August 2026 is a Saturday, so a Monday-start grid opens on 27 July.
    expect(cell('2026-07-27')).toBeOnTheScreen();
    expect(cell('2026-09-06')).toBeOnTheScreen();
  });

  it('marks the selected day with accessibility state, not colour alone', async () => {
    await renderGrid({ selected: date('2026-08-20') });

    expect(cell('2026-08-20')).toBeSelected();
    expect(cell('2026-08-15')).not.toBeSelected();
  });

  it('marks exactly one day as selected', async () => {
    await renderGrid({ selected: date('2026-08-20') });

    const selected = screen
      .getAllByRole('button')
      .filter(node => node.props.accessibilityState?.selected === true);
    expect(selected).toHaveLength(1);
  });

  it('reports the selected date when a day is pressed', async () => {
    const { onSelectDate } = await renderGrid();

    await fireEvent.press(cell('2026-08-12'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-08-12');
  });

  it('reports a borrowed day with its own real date, not one clamped into the month', async () => {
    const { onSelectDate } = await renderGrid();

    await fireEvent.press(cell('2026-09-01'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-09-01');
  });

  it('announces the event count for each day', async () => {
    await renderGrid({ counts: new Map([[date('2026-08-18'), 3]]) });

    expect(cell('2026-08-18')).toHaveProp('accessibilityHint', '3 events');
    expect(cell('2026-08-19')).toHaveProp('accessibilityHint', 'No events');
  });

  it('uses the singular form for a single event', async () => {
    await renderGrid({ counts: new Map([[date('2026-08-18'), 1]]) });
    expect(cell('2026-08-18')).toHaveProp('accessibilityHint', '1 event');
  });
});
