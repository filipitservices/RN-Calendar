import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { CalendarEvent, EventDraft, EventId } from '../../domain/events/event';
import type { EventFailure, EventService } from '../../services/events/eventService';

export type EventsContextValue = {
  events: readonly CalendarEvent[];
  createEvent: (draft: EventDraft) => Promise<EventFailure | null>;
  updateEvent: (id: EventId, draft: EventDraft) => Promise<EventFailure | null>;
  deleteEvent: (id: EventId) => Promise<EventFailure | null>;
};

const EventsContext = createContext<EventsContextValue | null>(null);

export type EventsProviderProps = {
  service: EventService;
  userId: string | null;
  children: ReactNode;
};

/** Screens derive agenda and counts from `events` during render. The list resets on sign-out. */
export const EventsProvider = ({ service, userId, children }: EventsProviderProps) => {
  const [events, setEvents] = useState<readonly CalendarEvent[]>([]);

  useEffect(() => {
    if (userId === null) {
      setEvents([]);
      return;
    }
    let active = true;
    const load = async () => {
      const loaded = await service.listForUser(userId).catch(() => []);
      if (active) {
        setEvents(loaded);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [service, userId]);

  const createEvent = useCallback(
    async (draft: EventDraft): Promise<EventFailure | null> => {
      if (userId === null) {
        return { kind: 'storageUnavailable' };
      }
      const result = await service.create(userId, draft);
      if (!result.ok) {
        return result.error;
      }
      setEvents(current => [...current, result.value]);
      return null;
    },
    [service, userId],
  );

  const updateEvent = useCallback(
    async (id: EventId, draft: EventDraft): Promise<EventFailure | null> => {
      if (userId === null) {
        return { kind: 'storageUnavailable' };
      }
      const result = await service.update(userId, id, draft);
      if (!result.ok) {
        return result.error;
      }
      const updated = result.value;
      setEvents(current => current.map(event => (event.id === id ? updated : event)));
      return null;
    },
    [service, userId],
  );

  const deleteEvent = useCallback(
    async (id: EventId): Promise<EventFailure | null> => {
      if (userId === null) {
        return { kind: 'storageUnavailable' };
      }
      const result = await service.remove(userId, id);
      if (!result.ok) {
        return result.error;
      }
      setEvents(current => current.filter(event => event.id !== id));
      return null;
    },
    [service, userId],
  );

  const value = useMemo<EventsContextValue>(
    () => ({ events, createEvent, updateEvent, deleteEvent }),
    [events, createEvent, updateEvent, deleteEvent],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = (): EventsContextValue => {
  const value = useContext(EventsContext);
  if (value === null) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return value;
};

export const eventFailureMessage = (failure: EventFailure): string => {
  switch (failure.kind) {
    case 'notFound':
      return 'That event no longer exists.';
    case 'invalidDraft':
      return 'Please correct the highlighted fields.';
    case 'storageUnavailable':
      return 'Could not save the event. Please try again.';
  }
};
