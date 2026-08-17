import type { EventDraft } from './event';
import { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH, isAllowedEventNotes, isAllowedEventTitle } from './event';

export type EventFieldErrors = {
  readonly title?: string;
  readonly startMinutes?: string;
  readonly endMinutes?: string;
  readonly notes?: string;
};

/**
 * Note what is *not* checked here: that each time falls inside a day. A
 * `TimeOfDay` can only be constructed in range, so that check would be
 * unreachable. Only the relationship between the two times needs validating.
 */
export const validateEventDraft = (draft: EventDraft): EventFieldErrors => {
  const errors: {
    title?: string;
    endMinutes?: string;
    notes?: string;
  } = {};

  const title = draft.title.trim();
  if (title.length === 0) {
    errors.title = 'Add a title so you can recognise this event.';
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the title under ${TITLE_MAX_LENGTH} characters.`;
  } else if (!isAllowedEventTitle(title)) {
    errors.title = 'Use letters, numbers, spaces, and ordinary punctuation only.';
  }

  if (draft.endMinutes <= draft.startMinutes) {
    errors.endMinutes = 'The end time must be after the start time.';
  }

  if (draft.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Keep notes under ${NOTES_MAX_LENGTH} characters.`;
  } else if (!isAllowedEventNotes(draft.notes)) {
    errors.notes = 'Notes cannot include control characters.';
  }

  return errors;
};

/**
 * Checks for defined values rather than key count: callers may build an error
 * object with keys explicitly set to `undefined`, which must not read as an error.
 */
export const hasErrors = (errors: EventFieldErrors): boolean =>
  Object.values(errors).some(message => message !== undefined);
