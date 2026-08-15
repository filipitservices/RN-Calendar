import type { User } from '../../domain/auth/user';
import type { AuthFailure } from '../../services/auth/authService';

/**
 * Session state as a discriminated union. There is no way to represent
 * "signed in but no user" or "signed out while still loading", so screens
 * cannot be written against an impossible combination.
 */
export type AuthState =
  | { status: 'restoring' }
  | { status: 'signedOut'; pending: boolean; failure: AuthFailure | null }
  | { status: 'signedIn'; user: User };

export type AuthAction =
  | { type: 'restored'; user: User | null }
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

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'restored':
      return action.user === null ? signedOut() : { status: 'signedIn', user: action.user };

    case 'submitStarted':
      // Only meaningful while signed out; ignored otherwise so a stale action
      // cannot knock an authenticated session back into a form state.
      return state.status === 'signedOut' ? signedOut(true, null) : state;

    case 'submitFailed':
      return state.status === 'signedOut' ? signedOut(false, action.failure) : state;

    case 'authenticated':
      return { status: 'signedIn', user: action.user };

    case 'signedOut':
      return signedOut();

    case 'failureDismissed':
      return state.status === 'signedOut' ? signedOut(state.pending, null) : state;

    default:
      return state;
  }
};
