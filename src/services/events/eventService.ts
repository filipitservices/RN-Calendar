import type { CalendarEvent, EventDraft, EventId } from '../../domain/events/event';
import type { Result } from '../../lib/result';

export type EventFailure =
  | { kind: 'notFound' }
  | { kind: 'invalidDraft' }
  | { kind: 'storageUnavailable' };

export type EventResult<T> = Result<T, EventFailure>;

/**
 * Event persistence seam. Events are scoped per user so signing in as a
 * different account shows a different calendar.
 */
export type EventService = {
  listForUser(userId: string): Promise<readonly CalendarEvent[]>;
  create(userId: string, draft: EventDraft): Promise<EventResult<CalendarEvent>>;
  update(userId: string, id: EventId, draft: EventDraft): Promise<EventResult<CalendarEvent>>;
  remove(userId: string, id: EventId): Promise<EventResult<EventId>>;
};
