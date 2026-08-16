import type { User } from '../../domain/auth/user';
import type { AuthFailure } from '../../services/auth/authService';
import type { SecureCredentialFailure } from '../../services/storage/secureCredentialStore';

/**
 * Session state as a discriminated union. Calendar is only represented by
 * signedIn. The biometric prompt runs on Sign-in while `locked`, which keeps
 * the Firebase user without exposing the app.
 */
export type AuthState =
  | { status: 'restoring' }
  | { status: 'locked'; user: User; pending: boolean; failure: AuthFailure | null; gateFailure: SecureCredentialFailure | null }
  | { status: 'signedOut'; pending: boolean; failure: AuthFailure | null }
  | { status: 'signedIn'; user: User };

export type AuthAction =
  | { type: 'restored'; user: User | null }
  | { type: 'unlocked'; user: User }
  | { type: 'locked'; user: User; gateFailure: SecureCredentialFailure | null }
  | { type: 'submitStarted' }
  | { type: 'submitFailed'; failure: AuthFailure }
  | { type: 'authenticated'; user: User }
  | { type: 'signedOut' }
  | { type: 'failureDismissed' };

export const initialAuthState: AuthState = { status: 'restoring' };

const signedOut = (
  pending = false,
  failure: AuthFailure | null = null,
): AuthState => ({ status: 'signedOut', pending, failure });

const locked = (
  user: User,
  pending = false,
  failure: AuthFailure | null = null,
  gateFailure: SecureCredentialFailure | null = null,
): AuthState => ({ status: 'locked', user, pending, failure, gateFailure });

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'restored':
      return action.user === null ? signedOut() : { status: 'signedIn', user: action.user };

    case 'unlocked':
      return { status: 'signedIn', user: action.user };

    case 'locked':
      return locked(action.user, false, null, action.gateFailure);

    case 'submitStarted':
      if (state.status === 'signedOut') {
        return signedOut(true, null);
      }
      if (state.status === 'locked') {
        return locked(state.user, true, null, null);
      }
      return state;

    case 'submitFailed':
      if (state.status === 'signedOut') {
        return signedOut(false, action.failure);
      }
      if (state.status === 'locked') {
        return locked(state.user, false, action.failure, null);
      }
      return state;

    case 'authenticated':
      return { status: 'signedIn', user: action.user };

    case 'signedOut':
      return signedOut();

    case 'failureDismissed':
      if (state.status === 'signedOut') {
        return signedOut(state.pending, null);
      }
      if (state.status === 'locked') {
        return locked(state.user, state.pending, null, null);
      }
      return state;
  }
};
