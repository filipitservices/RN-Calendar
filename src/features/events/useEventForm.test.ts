import { act, renderHook } from '@testing-library/react-native';

import { parseCalendarDate } from '../../domain/date/calendarDate';
import { timeOfDayFromParts } from '../../domain/date/timeOfDay';
import { asEventId } from '../../domain/events/event';
import type { CalendarEvent } from '../../domain/events/event';
import { useEventForm } from './useEventForm';

const date = parseCalendarDate('2026-08-15');
if (date === null) {
  throw new Error('Test fixture is not a valid date');
}

const existingEvent: CalendarEvent = {
  id: asEventId('e1'),
  title: 'Team sync',
  notes: 'Weekly catch-up',
  date,
  startMinutes: timeOfDayFromParts(14, 30),
  endMinutes: timeOfDayFromParts(15, 45),
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

describe('useEventForm in create mode', () => {
  it('starts empty with a sensible default hour', async () => {
    const { result } = await renderHook(() => useEventForm(date, null));

    expect(result.current.fields.title).toBe('');
    expect(result.current.fields.notes).toBe('');
    expect(result.current.fields.start).toBe(timeOfDayFromParts(9, 0));
    expect(result.current.fields.end).toBe(timeOfDayFromParts(10, 0));
  });

  it('withholds errors until the first submit attempt', async () => {
    const { result } = await renderHook(() => useEventForm(date, null));

    expect(result.current.showErrors).toBe(false);
    expect(result.current.errors.title).toBeDefined();

    await act(() => {
      result.current.submit();
    });
    expect(result.current.showErrors).toBe(true);
  });

  it('refuses to produce a draft while the title is empty', async () => {
    const { result } = await renderHook(() => useEventForm(date, null));

    let draft;
    await act(() => {
      draft = result.current.submit();
    });
    expect(draft).toBeNull();
  });

  it('produces a draft carrying the fixed date once the form is valid', async () => {
    const { result } = await renderHook(() => useEventForm(date, null));

    await act(() => {
      result.current.setField('title', 'Design review');
    });

    let draft;
    await act(() => {
      draft = result.current.submit();
    });

    expect(draft).toEqual({
      title: 'Design review',
      notes: '',
      date,
      startMinutes: timeOfDayFromParts(9, 0),
      endMinutes: timeOfDayFromParts(10, 0),
    });
  });

  it('rejects an end time that is not after the start', async () => {
    const { result } = await renderHook(() => useEventForm(date, null));

    await act(() => {
      result.current.setField('title', 'Design review');
      result.current.setField('start', timeOfDayFromParts(15, 0));
      result.current.setField('end', timeOfDayFromParts(14, 0));
    });

    expect(result.current.errors.endMinutes).toBeDefined();

    let draft;
    await act(() => {
      draft = result.current.submit();
    });
    expect(draft).toBeNull();
  });
});

describe('useEventForm in edit mode', () => {
  it('pre-fills from the existing event', async () => {
    const { result } = await renderHook(() => useEventForm(date, existingEvent));

    expect(result.current.fields.title).toBe('Team sync');
    expect(result.current.fields.notes).toBe('Weekly catch-up');
    expect(result.current.fields.start).toBe(timeOfDayFromParts(14, 30));
    expect(result.current.fields.end).toBe(timeOfDayFromParts(15, 45));
    expect(result.current.errors).toEqual({});
  });

  it('shows an event without notes as an empty field, not the string "null"', async () => {
    const { result } = await renderHook(() =>
      useEventForm(date, { ...existingEvent, notes: null }),
    );
    expect(result.current.fields.notes).toBe('');
  });

  it('produces an updated draft using the same validation as create', async () => {
    const { result } = await renderHook(() => useEventForm(date, existingEvent));

    await act(() => {
      result.current.setField('title', 'Team sync (moved)');
      result.current.setField('start', timeOfDayFromParts(16, 0));
      result.current.setField('end', timeOfDayFromParts(17, 0));
    });

    let draft;
    await act(() => {
      draft = result.current.submit();
    });

    expect(draft).toEqual({
      title: 'Team sync (moved)',
      notes: 'Weekly catch-up',
      date,
      startMinutes: timeOfDayFromParts(16, 0),
      endMinutes: timeOfDayFromParts(17, 0),
    });
  });
});
