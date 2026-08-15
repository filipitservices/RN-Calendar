import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
} from '@react-native-firebase/firestore';

import { asEventId, compareEvents, decodeCalendarEvent } from '../../domain/events/event';
import type { CalendarEvent, EventDraft, EventId } from '../../domain/events/event';
import { hasErrors, validateEventDraft } from '../../domain/events/validation';
import { err, ok } from '../../lib/result';
import type { EventResult, EventService } from './eventService';

const eventsCollection = (userId: string) =>
  collection(getFirestore(), 'users', userId, 'events');

const eventDoc = (userId: string, id: string) => doc(getFirestore(), 'users', userId, 'events', id);

const fromDraft = (draft: EventDraft) => ({
  title: draft.title.trim(),
  notes: draft.notes.trim().length > 0 ? draft.notes.trim() : null,
  date: draft.date,
  startMinutes: draft.startMinutes,
  endMinutes: draft.endMinutes,
});

const decodeSnapshot = (id: string, data: unknown): CalendarEvent | null => {
  if (typeof data !== 'object' || data === null) {
    return decodeCalendarEvent({ id });
  }
  return decodeCalendarEvent({ ...data, id });
};

export const createFirestoreEventService = (): EventService => ({
  async listForUser(userId) {
    try {
      const snapshot = await getDocs(eventsCollection(userId));
      const events: CalendarEvent[] = [];
      for (const document of snapshot.docs) {
        const event = decodeSnapshot(document.id, document.data());
        if (event !== null) {
          events.push(event);
        }
      }
      return events.sort(compareEvents);
    } catch {
      return [];
    }
  },

  async create(userId, draft): Promise<EventResult<CalendarEvent>> {
    if (hasErrors(validateEventDraft(draft))) {
      return err({ kind: 'invalidDraft' });
    }
    try {
      const now = new Date().toISOString();
      const fields = { ...fromDraft(draft), createdAt: now, updatedAt: now };
      const reference = await addDoc(eventsCollection(userId), fields);
      return ok({
        id: asEventId(reference.id),
        ...fields,
      });
    } catch {
      return err({ kind: 'storageUnavailable' });
    }
  },

  async update(userId, id, draft): Promise<EventResult<CalendarEvent>> {
    if (hasErrors(validateEventDraft(draft))) {
      return err({ kind: 'invalidDraft' });
    }
    try {
      const reference = eventDoc(userId, id);
      const existing = await getDoc(reference);
      if (!existing.exists()) {
        return err({ kind: 'notFound' });
      }
      const previous = decodeSnapshot(existing.id, existing.data());
      if (previous === null) {
        return err({ kind: 'notFound' });
      }
      const updated: CalendarEvent = {
        ...previous,
        ...fromDraft(draft),
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(reference, {
        title: updated.title,
        notes: updated.notes,
        date: updated.date,
        startMinutes: updated.startMinutes,
        endMinutes: updated.endMinutes,
        updatedAt: updated.updatedAt,
      });
      return ok(updated);
    } catch {
      return err({ kind: 'storageUnavailable' });
    }
  },

  async remove(userId, id: EventId): Promise<EventResult<EventId>> {
    try {
      const reference = eventDoc(userId, id);
      const existing = await getDoc(reference);
      if (!existing.exists()) {
        return err({ kind: 'notFound' });
      }
      await deleteDoc(reference);
      return ok(id);
    } catch {
      return err({ kind: 'storageUnavailable' });
    }
  },
});
