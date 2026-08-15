import { asUserId, normaliseEmail } from '../../domain/auth/user';
import type { Credentials, Registration, User } from '../../domain/auth/user';
import { err, ok } from '../../lib/result';
import type { AuthResult, AuthService } from '../../services/auth/authService';

type StoredAccount = {
  user: User;
  password: string;
};

type Listener = (user: User | null) => void;

let nextUserId = 1;

const testUserId = (): string => {
  const id = `test-user-${nextUserId}`;
  nextUserId += 1;
  return id;
};

/**
 * In-memory AuthService for tests. Not a model of Firebase — just enough
 * behaviour for AppShell integration tests without the native SDK.
 */
export const createTestAuthService = (): AuthService => {
  const accounts: StoredAccount[] = [];
  let session: User | null = null;
  const listeners = new Set<Listener>();

  const emit = (user: User | null) => {
    session = user;
    for (const listener of listeners) {
      listener(user);
    }
  };

  const findAccount = (email: string) =>
    accounts.find(account => account.user.email === normaliseEmail(email));

  return {
    subscribe(listener) {
      listeners.add(listener);
      void Promise.resolve().then(() => listener(session));
      return () => {
        listeners.delete(listener);
      };
    },

    async register(registration: Registration): Promise<AuthResult> {
      if (findAccount(registration.email) !== undefined) {
        return err({ kind: 'emailAlreadyRegistered' });
      }

      const user: User = {
        id: asUserId(testUserId()),
        email: normaliseEmail(registration.email),
        displayName: registration.displayName.trim(),
        createdAt: new Date().toISOString(),
      };

      accounts.push({ user, password: registration.password });
      emit(user);
      return ok(user);
    },

    async signIn(credentials: Credentials): Promise<AuthResult> {
      const account = findAccount(credentials.email);
      if (account === undefined || account.password !== credentials.password) {
        return err({ kind: 'invalidCredentials' });
      }
      emit(account.user);
      return ok(account.user);
    },

    async signOut(): Promise<void> {
      emit(null);
    },
  };
};
