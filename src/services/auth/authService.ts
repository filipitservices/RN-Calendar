import type { Credentials, Registration, User } from '../../domain/auth/user';
import type { Result } from '../../lib/result';

/**
 * Failure modes callers must handle. Kept as a closed union so screens can map
 * each case to a message without a catch-all branch.
 */
export type AuthFailure =
  | { kind: 'invalidCredentials' }
  | { kind: 'emailAlreadyRegistered' }
  | { kind: 'unavailable' };

export type AuthResult = Result<User, AuthFailure>;

/**
 * The seam between the app and authentication. Production uses Firebase;
 * tests inject an in-memory implementation of the same interface.
 */
export type AuthService = {
  /**
   * Subscribes to the current user. The first emission is the restored session
   * (`null` if signed out). Returns an unsubscribe function.
   */
  subscribe(listener: (user: User | null) => void): () => void;
  register(registration: Registration): Promise<AuthResult>;
  signIn(credentials: Credentials): Promise<AuthResult>;
  signOut(): Promise<void>;
};
