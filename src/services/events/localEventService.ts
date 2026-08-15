import { asEventId, compareEvents, decodeCalendarEvent } from '../../domain/events/event';
import type { CalendarEvent, EventDraft, EventId } from '../../domain/events/event';
import { hasErrors, validateEventDraft } from '../../domain/events/validation';
import { createId } from '../../lib/id';
import { err, ok } from '../../lib/result';
import { readJson, writeJson } from '../storage/keyValueStore';
import type { KeyValueStore } from '../storage/keyValueStore';
import type { EventResult, EventService } from './eventService';

const eventsKey = (userId: string): string => `events/${userId}`;

const decodeEvents = (value: unknown): CalendarEvent[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  // Malformed records are dropped rather than trusted or thrown on, so one bad
  // entry cannot take down the calendar.
  return value
    .map(decodeCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null)
    .sort(compareEvents);
};

const fromDraft = (draft: EventDraft) => ({
  title: draft.title.trim(),
  notes: draft.notes.trim().length > 0 ? draft.notes.trim() : null,
  date: draft.date,
  startMinutes: draft.startMinutes,
  endMinutes: draft.endMinutes,
});

/**
 * In-memory EventService used by tests. Production uses Cloud Firestore.
 */
export const createLocalEventService = (store: KeyValueStore): EventService => {
  const load = async (userId: string): Promise<CalendarEvent[]> =>
    decodeEvents(await readJson(store, eventsKey(userId)));

  const save = (userId: string, events: readonly CalendarEvent[]): Promise<void> =>
    writeJson(store, eventsKey(userId), [...events].sort(compareEvents));

  return {
    listForUser: load,

    async create(userId: string, draft: EventDraft): Promise<EventResult<CalendarEvent>> {
      // Validated here as well as in the form, so the service cannot be made to
      // persist an invalid event by a future caller.
      if (hasErrors(validateEventDraft(draft))) {
        return err({ kind: 'invalidDraft' });
      }
      try {
        const now = new Date().toISOString();
        const event: CalendarEvent = {
          id: asEventId(createId()),
          ...fromDraft(draft),
          createdAt: now,
          updatedAt: now,
        };
        await save(userId, [...(await load(userId)), event]);
        return ok(event);
      } catch {
        return err({ kind: 'storageUnavailable' });
      }
    },

    async update(
      userId: string,
      id: EventId,
      draft: EventDraft,
    ): Promise<EventResult<CalendarEvent>> {
      if (hasErrors(validateEventDraft(draft))) {
        return err({ kind: 'invalidDraft' });
      }
      try {
        const events = await load(userId);
        const existing = events.find(event => event.id === id);
        if (existing === undefined) {
          return err({ kind: 'notFound' });
        }
        const updated: CalendarEvent = {
          ...existing,
          ...fromDraft(draft),
          updatedAt: new Date().toISOString(),
        };
        await save(
          userId,
          events.map(event => (event.id === id ? updated : event)),
        );
        return ok(updated);
      } catch {
        return err({ kind: 'storageUnavailable' });
      }
    },

    async remove(userId: string, id: EventId): Promise<EventResult<EventId>> {
      try {
        const events = await load(userId);
        if (!events.some(event => event.id === id)) {
          return err({ kind: 'notFound' });
        }
        await save(
          userId,
          events.filter(event => event.id !== id),
        );
        return ok(id);
      } catch {
        return err({ kind: 'storageUnavailable' });
      }
    },
  };
};
