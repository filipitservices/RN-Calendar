import type { Credentials, Registration, User } from '../../domain/auth/user';
import type { Result } from '../../lib/result';

/**
 * Failure modes callers must handle. Kept as a closed union so screens can map
 * each case to a message without a catch-all branch.
 */
export type AuthFailure =
  | { kind: 'invalidCredentials' }
  | { kind: 'emailAlreadyRegistered' }
  | { kind: 'storageUnavailable' };

export type AuthResult = Result<User, AuthFailure>;

/**
 * The seam between the app and whatever backs authentication. The MVP
 * implementation is device-local; replacing it with an HTTP client means
 * writing a new implementation of this interface and nothing else.
 */
export type AuthService = {
  /** Returns the persisted session's user, or null if nobody is signed in. */
  restoreSession(): Promise<User | null>;
  register(registration: Registration): Promise<AuthResult>;
  signIn(credentials: Credentials): Promise<AuthResult>;
  signOut(): Promise<void>;
};
