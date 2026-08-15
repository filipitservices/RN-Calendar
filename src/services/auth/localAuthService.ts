import { asUserId, decodeUser, normaliseEmail } from '../../domain/auth/user';
import type { Credentials, Registration, User } from '../../domain/auth/user';
import { createId } from '../../lib/id';
import { err, ok } from '../../lib/result';
import { readJson, writeJson } from '../storage/keyValueStore';
import type { KeyValueStore } from '../storage/keyValueStore';
import type { AuthResult, AuthService } from './authService';

const ACCOUNTS_KEY = 'auth/accounts';
const SESSION_KEY = 'auth/session';

/**
 * In-memory/device-local AuthService used by tests. Production uses Firebase.
 * Passwords here are still stored in plain form because this is a test double,
 * not a security boundary.
 */
type StoredAccount = {
  user: User;
  password: string;
};

type Listener = (user: User | null) => void;

const decodeAccounts = (value: unknown): StoredAccount[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const accounts: StoredAccount[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const user = decodeUser(record.user);
    if (user !== null && typeof record.password === 'string') {
      accounts.push({ user, password: record.password });
    }
  }
  return accounts;
};

export const createLocalAuthService = (store: KeyValueStore): AuthService => {
  const listeners = new Set<Listener>();
  let epoch = 0;

  const emit = (user: User | null) => {
    epoch += 1;
    for (const listener of listeners) {
      listener(user);
    }
  };

  const loadAccounts = async (): Promise<StoredAccount[]> =>
    decodeAccounts(await readJson(store, ACCOUNTS_KEY));

  const findAccount = (accounts: readonly StoredAccount[], email: string) =>
    accounts.find(account => account.user.email === normaliseEmail(email));

  const readSession = async (): Promise<User | null> => {
    const session = await readJson(store, SESSION_KEY);
    if (typeof session !== 'object' || session === null) {
      return null;
    }
    const userId = (session as Record<string, unknown>).userId;
    if (typeof userId !== 'string') {
      return null;
    }
    const accounts = await loadAccounts();
    return accounts.find(account => account.user.id === userId)?.user ?? null;
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      const started = epoch;
      void readSession().then(user => {
        if (started === epoch) {
          listener(user);
        }
      });
      return () => {
        listeners.delete(listener);
      };
    },

    async register(registration: Registration): Promise<AuthResult> {
      try {
        const accounts = await loadAccounts();
        if (findAccount(accounts, registration.email) !== undefined) {
          return err({ kind: 'emailAlreadyRegistered' });
        }

        const user: User = {
          id: asUserId(createId()),
          email: normaliseEmail(registration.email),
          displayName: registration.displayName.trim(),
          createdAt: new Date().toISOString(),
        };

        await writeJson(store, ACCOUNTS_KEY, [
          ...accounts,
          { user, password: registration.password },
        ]);
        await writeJson(store, SESSION_KEY, { userId: user.id });
        emit(user);
        return ok(user);
      } catch {
        return err({ kind: 'unavailable' });
      }
    },

    async signIn(credentials: Credentials): Promise<AuthResult> {
      try {
        const accounts = await loadAccounts();
        const account = findAccount(accounts, credentials.email);
        if (account === undefined || account.password !== credentials.password) {
          return err({ kind: 'invalidCredentials' });
        }
        await writeJson(store, SESSION_KEY, { userId: account.user.id });
        emit(account.user);
        return ok(account.user);
      } catch {
        return err({ kind: 'unavailable' });
      }
    },

    async signOut(): Promise<void> {
      await store.remove(SESSION_KEY);
      emit(null);
    },
  };
};
