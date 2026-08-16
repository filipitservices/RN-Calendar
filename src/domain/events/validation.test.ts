import { parseCalendarDate } from '../date/calendarDate';
import { timeOfDayFromParts } from '../date/timeOfDay';
import type { EventDraft } from './event';
import { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH, hasErrors, validateEventDraft } from './validation';

const date = parseCalendarDate('2026-08-15');
if (date === null) {
  throw new Error('Test fixture is not a valid date');
}

const draft = (overrides: Partial<EventDraft> = {}): EventDraft => ({
  title: 'Team sync',
  notes: '',
  date,
  startMinutes: timeOfDayFromParts(9, 0),
  endMinutes: timeOfDayFromParts(10, 0),
  ...overrides,
});

describe('validateEventDraft', () => {
  it('accepts a well-formed draft', () => {
    expect(validateEventDraft(draft())).toEqual({});
  });

  it('requires a title that is not just whitespace', () => {
    expect(validateEventDraft(draft({ title: '' })).title).toBeDefined();
    expect(validateEventDraft(draft({ title: '   ' })).title).toBeDefined();
  });

  it('bounds the title length', () => {
    expect(validateEventDraft(draft({ title: 'a'.repeat(TITLE_MAX_LENGTH) })).title).toBeUndefined();
    expect(
      validateEventDraft(draft({ title: 'a'.repeat(TITLE_MAX_LENGTH + 1) })).title,
    ).toBeDefined();
  });

  it('requires the end to be strictly after the start', () => {
    const equal = draft({
      startMinutes: timeOfDayFromParts(10, 0),
      endMinutes: timeOfDayFromParts(10, 0),
    });
    expect(validateEventDraft(equal).endMinutes).toBeDefined();

    const reversed = draft({
      startMinutes: timeOfDayFromParts(11, 0),
      endMinutes: timeOfDayFromParts(10, 0),
    });
    expect(validateEventDraft(reversed).endMinutes).toBeDefined();
  });

  it('bounds the notes length', () => {
    expect(validateEventDraft(draft({ notes: 'a'.repeat(NOTES_MAX_LENGTH) })).notes).toBeUndefined();
    expect(
      validateEventDraft(draft({ notes: 'a'.repeat(NOTES_MAX_LENGTH + 1) })).notes,
    ).toBeDefined();
  });

  it('reports every offending field at once rather than stopping at the first', () => {
    const errors = validateEventDraft(
      draft({
        title: '',
        notes: 'a'.repeat(NOTES_MAX_LENGTH + 1),
        startMinutes: timeOfDayFromParts(12, 0),
        endMinutes: timeOfDayFromParts(11, 0),
      }),
    );
    expect(Object.keys(errors).sort()).toEqual(['endMinutes', 'notes', 'title']);
    expect(hasErrors(errors)).toBe(true);
  });
});

describe('hasErrors', () => {
  it('ignores keys that are present but undefined', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ title: undefined, notes: undefined })).toBe(false);
    expect(hasErrors({ title: undefined, endMinutes: 'End time must be after the start time.' })).toBe(
      true,
    );
  });
});
