import { waitFor } from '@testing-library/react-native';

import type { User } from '../../domain/auth/user';
import type { AuthService } from './authService';
import { createMemoryKeyValueStore } from '../storage/memoryKeyValueStore';
import { createLocalAuthService } from './localAuthService';

const registration = {
  displayName: 'Alex Morgan',
  email: 'Alex@Example.com',
  password: 'calendar1',
};

const setup = () => {
  const store = createMemoryKeyValueStore();
  return { store, service: createLocalAuthService(store) };
};

const sessionOf = (service: AuthService): Promise<User | null> =>
  new Promise(resolve => {
    const stop = service.subscribe(user => {
      stop();
      resolve(user);
    });
  });

describe('localAuthService', () => {
  it('registers an account and signs the user straight in', async () => {
    const { service } = setup();
    const result = await service.register(registration);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe('alex@example.com');
      expect(result.value.displayName).toBe('Alex Morgan');
      expect(result.value.id).not.toBe('');
    }
    await expect(sessionOf(service)).resolves.not.toBeNull();
  });

  it('normalises the email so case does not create a second account', async () => {
    const { service } = setup();
    await service.register(registration);

    const duplicate = await service.register({ ...registration, email: 'ALEX@EXAMPLE.COM' });
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) {
      expect(duplicate.error.kind).toBe('emailAlreadyRegistered');
    }
  });

  it('signs in an existing account regardless of email case', async () => {
    const { service } = setup();
    await service.register(registration);
    await service.signOut();

    const result = await service.signIn({ email: 'alex@EXAMPLE.com', password: 'calendar1' });
    expect(result.ok).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const { service } = setup();
    await service.register(registration);

    const result = await service.signIn({ email: registration.email, password: 'wrong123' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalidCredentials');
    }
  });

  it('gives the same failure for an unknown email, so accounts are not enumerable', async () => {
    const { service } = setup();
    await service.register(registration);

    const unknown = await service.signIn({ email: 'nobody@example.com', password: 'calendar1' });
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) {
      expect(unknown.error.kind).toBe('invalidCredentials');
    }
  });

  it('restores nothing when no one has signed in', async () => {
    const { service } = setup();
    await expect(sessionOf(service)).resolves.toBeNull();
  });

  it('clears the session on sign-out but keeps the account', async () => {
    const { service } = setup();
    await service.register(registration);
    await service.signOut();

    await expect(sessionOf(service)).resolves.toBeNull();
    const back = await service.signIn({ email: registration.email, password: 'calendar1' });
    expect(back.ok).toBe(true);
  });

  it('keeps separate accounts distinct', async () => {
    const { service } = setup();
    await service.register(registration);
    const second = await service.register({
      displayName: 'Sam Lee',
      email: 'sam@example.com',
      password: 'calendar2',
    });

    expect(second.ok).toBe(true);
    const restored = await sessionOf(service);
    expect(restored?.email).toBe('sam@example.com');
  });

  it('survives a corrupt accounts entry instead of crashing', async () => {
    const store = createMemoryKeyValueStore({ 'auth/accounts': 'not json' });
    const service = createLocalAuthService(store);

    await expect(sessionOf(service)).resolves.toBeNull();
    const result = await service.register(registration);
    expect(result.ok).toBe(true);
  });

  it('drops malformed account records while keeping valid ones', async () => {
    const store = createMemoryKeyValueStore({
      'auth/accounts': JSON.stringify([
        { user: { id: '', email: 'broken' }, password: 'x' },
        {
          user: {
            id: 'u2',
            email: 'sam@example.com',
            displayName: 'Sam Lee',
            createdAt: '2026-08-01T10:00:00.000Z',
          },
          password: 'calendar2',
        },
      ]),
    });
    const service = createLocalAuthService(store);

    const result = await service.signIn({ email: 'sam@example.com', password: 'calendar2' });
    expect(result.ok).toBe(true);
  });

  it('notifies subscribers when the session changes', async () => {
    const { service } = setup();
    const seen: Array<User | null> = [];
    const stop = service.subscribe(user => {
      seen.push(user);
    });

    await waitFor(() => {
      expect(seen.length).toBeGreaterThan(0);
    });
    await service.register(registration);
    await service.signOut();
    stop();

    expect(seen[0]).toBeNull();
    expect(seen.some(user => user?.email === 'alex@example.com')).toBe(true);
    expect(seen[seen.length - 1]).toBeNull();
  });
});
