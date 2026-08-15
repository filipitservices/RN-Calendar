import { parseCalendarDate } from '../../domain/date/calendarDate';
import { timeOfDayFromParts } from '../../domain/date/timeOfDay';
import { asEventId } from '../../domain/events/event';
import type { EventDraft } from '../../domain/events/event';
import { createMemoryKeyValueStore } from '../storage/memoryKeyValueStore';
import { createLocalEventService } from './localEventService';

const USER = 'u1';

const date = (value: string) => {
  const parsed = parseCalendarDate(value);
  if (parsed === null) {
    throw new Error(`Test fixture is not a valid date: ${value}`);
  }
  return parsed;
};

const draft = (overrides: Partial<EventDraft> = {}): EventDraft => ({
  title: 'Team sync',
  notes: '',
  date: date('2026-08-15'),
  startMinutes: timeOfDayFromParts(9, 0),
  endMinutes: timeOfDayFromParts(10, 0),
  ...overrides,
});

const setup = (initial?: Record<string, string>) => {
  const store = createMemoryKeyValueStore(initial);
  return { store, service: createLocalEventService(store) };
};

describe('localEventService', () => {
  it('creates an event and persists it', async () => {
    const { service } = setup();
    const result = await service.create(USER, draft());

    expect(result.ok).toBe(true);
    const listed = await service.listForUser(USER);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe('Team sync');
  });

  it('trims the title and stores empty notes as null', async () => {
    const { service } = setup();
    const result = await service.create(USER, draft({ title: '  Team sync  ', notes: '   ' }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe('Team sync');
      expect(result.value.notes).toBeNull();
    }
  });

  it('refuses an invalid draft even though the form also validates', async () => {
    const { service } = setup();
    const result = await service.create(
      USER,
      draft({ startMinutes: timeOfDayFromParts(11, 0), endMinutes: timeOfDayFromParts(10, 0) }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalidDraft');
    }
    await expect(service.listForUser(USER)).resolves.toHaveLength(0);
  });

  it('updates an existing event in place, keeping its id and createdAt', async () => {
    const { service } = setup();
    const created = await service.create(USER, draft());
    if (!created.ok) {
      throw new Error('setup failed');
    }

    const updated = await service.update(
      USER,
      created.value.id,
      draft({ title: 'Renamed', date: date('2026-08-20') }),
    );

    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.value.id).toBe(created.value.id);
      expect(updated.value.createdAt).toBe(created.value.createdAt);
      expect(updated.value.title).toBe('Renamed');
      expect(updated.value.date).toBe('2026-08-20');
    }

    const listed = await service.listForUser(USER);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe('Renamed');
  });

  it('reports notFound when updating something that does not exist', async () => {
    const { service } = setup();
    const result = await service.update(USER, asEventId('missing'), draft());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('notFound');
    }
  });

  it('removes an event', async () => {
    const { service } = setup();
    const created = await service.create(USER, draft());
    if (!created.ok) {
      throw new Error('setup failed');
    }

    await expect(service.remove(USER, created.value.id)).resolves.toEqual({
      ok: true,
      value: created.value.id,
    });
    await expect(service.listForUser(USER)).resolves.toHaveLength(0);
  });

  it('keeps each user’s events separate', async () => {
    const { service } = setup();
    await service.create(USER, draft({ title: 'Mine' }));
    await service.create('u2', draft({ title: 'Theirs' }));

    await expect(service.listForUser(USER)).resolves.toHaveLength(1);
    const other = await service.listForUser('u2');
    expect(other[0]?.title).toBe('Theirs');
  });

  it('returns events in chronological order regardless of insertion order', async () => {
    const { service } = setup();
    await service.create(
      USER,
      draft({
        title: 'Late',
        startMinutes: timeOfDayFromParts(16, 0),
        endMinutes: timeOfDayFromParts(17, 0),
      }),
    );
    await service.create(
      USER,
      draft({
        title: 'Early',
        startMinutes: timeOfDayFromParts(8, 0),
        endMinutes: timeOfDayFromParts(9, 0),
      }),
    );
    await service.create(
      USER,
      draft({ title: 'Yesterday', date: date('2026-08-14') }),
    );

    const listed = await service.listForUser(USER);
    expect(listed.map(event => event.title)).toEqual(['Yesterday', 'Early', 'Late']);
  });

  it('returns an empty list for a user with no stored events', async () => {
    const { service } = setup();
    await expect(service.listForUser('nobody')).resolves.toEqual([]);
  });

  it('drops corrupt records rather than failing the whole list', async () => {
    const { service } = setup({
      [`events/${USER}`]: JSON.stringify([
        { id: 'bad', title: 'Broken', date: '2026-02-30', startMinutes: 540, endMinutes: 600 },
        {
          id: 'good',
          title: 'Valid',
          notes: null,
          date: '2026-08-15',
          startMinutes: 540,
          endMinutes: 600,
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-01T10:00:00.000Z',
        },
      ]),
    });

    const listed = await service.listForUser(USER);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe('Valid');
  });

  it('treats unparseable storage as empty rather than throwing', async () => {
    const { service } = setup({ [`events/${USER}`]: '{{{' });
    await expect(service.listForUser(USER)).resolves.toEqual([]);
  });
});
