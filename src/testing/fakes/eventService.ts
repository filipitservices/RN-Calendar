import { asEventId, compareEvents, fieldsFromDraft } from '../../domain/events/event';
import type { CalendarEvent, EventId } from '../../domain/events/event';
import { hasErrors, validateEventDraft } from '../../domain/events/validation';
import { err, ok } from '../../lib/result';
import type { EventResult, EventService } from '../../services/events/eventService';

let nextEventId = 1;

const testEventId = (): string => {
  const id = `test-event-${nextEventId}`;
  nextEventId += 1;
  return id;
};

/** In-memory EventService for AppShell tests. Not a model of Firestore. */
export const createTestEventService = (): EventService => {
  const eventsByUser = new Map<string, CalendarEvent[]>();

  const load = (userId: string): CalendarEvent[] => eventsByUser.get(userId) ?? [];

  const save = (userId: string, events: readonly CalendarEvent[]): void => {
    eventsByUser.set(userId, [...events].sort(compareEvents));
  };

  return {
    listForUser: userId => Promise.resolve(load(userId)),

    async create(userId, draft): Promise<EventResult<CalendarEvent>> {
      if (hasErrors(validateEventDraft(draft))) {
        return err({ kind: 'invalidDraft' });
      }
      const now = new Date().toISOString();
      const event: CalendarEvent = {
        id: asEventId(testEventId()),
        ...fieldsFromDraft(draft),
        createdAt: now,
        updatedAt: now,
      };
      save(userId, [...load(userId), event]);
      return ok(event);
    },

    async update(userId, id, draft): Promise<EventResult<CalendarEvent>> {
      if (hasErrors(validateEventDraft(draft))) {
        return err({ kind: 'invalidDraft' });
      }
      const events = load(userId);
      const existing = events.find(event => event.id === id);
      if (existing === undefined) {
        return err({ kind: 'notFound' });
      }
      const updated: CalendarEvent = {
        ...existing,
        ...fieldsFromDraft(draft),
        updatedAt: new Date().toISOString(),
      };
      save(
        userId,
        events.map(event => (event.id === id ? updated : event)),
      );
      return ok(updated);
    },

    async remove(userId, id: EventId): Promise<EventResult<EventId>> {
      const events = load(userId);
      if (!events.some(event => event.id === id)) {
        return err({ kind: 'notFound' });
      }
      save(
        userId,
        events.filter(event => event.id !== id),
      );
      return ok(id);
    },
  };
};
