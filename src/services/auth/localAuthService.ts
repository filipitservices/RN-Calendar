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
 * A registered account as persisted on the device.
 *
 * NOTE: the password is held in device-local storage in plain form. This is
 * deliberate and honest for an MVP with no backend — it is *not* a security
 * boundary, and no attempt is made to imply otherwise by hashing it locally
 * (a client-side digest with a client-side salt protects nothing). Credential
 * handling belongs on a server behind `AuthService`; because screens only ever
 * see that interface, moving it there requires no UI changes.
 */
type StoredAccount = {
  user: User;
  password: string;
};

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
  const loadAccounts = async (): Promise<StoredAccount[]> =>
    decodeAccounts(await readJson(store, ACCOUNTS_KEY));

  const findAccount = (accounts: readonly StoredAccount[], email: string) =>
    accounts.find(account => account.user.email === normaliseEmail(email));

  return {
    async restoreSession(): Promise<User | null> {
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
        return ok(user);
      } catch {
        return err({ kind: 'storageUnavailable' });
      }
    },

    async signIn(credentials: Credentials): Promise<AuthResult> {
      try {
        const accounts = await loadAccounts();
        const account = findAccount(accounts, credentials.email);
        // Same failure for unknown email and wrong password, so the response
        // does not reveal which addresses are registered.
        if (account === undefined || account.password !== credentials.password) {
          return err({ kind: 'invalidCredentials' });
        }
        await writeJson(store, SESSION_KEY, { userId: account.user.id });
        return ok(account.user);
      } catch {
        return err({ kind: 'storageUnavailable' });
      }
    },

    async signOut(): Promise<void> {
      // Clears the session only; registered accounts survive so the user can
      // sign back in.
      await store.remove(SESSION_KEY);
    },
  };
};
