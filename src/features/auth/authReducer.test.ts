import { asUserId } from '../../domain/auth/user';
import type { User } from '../../domain/auth/user';
import { authReducer, initialAuthState } from './authReducer';
import type { AuthState } from './authReducer';

const user: User = {
  id: asUserId('u1'),
  email: 'alex@example.com',
  displayName: 'Alex Morgan',
  createdAt: '2026-08-01T10:00:00.000Z',
};

describe('authReducer', () => {
  it('starts by restoring, so the sign-in screen never flashes at a signed-in user', () => {
    expect(initialAuthState).toEqual({ status: 'restoring' });
  });

  it('restores into signedIn or signedOut from the session', () => {
    expect(authReducer(initialAuthState, { type: 'restored', user })).toEqual({
      status: 'signedIn',
      user,
    });
    expect(authReducer(initialAuthState, { type: 'restored', user: null })).toEqual({
      status: 'signedOut',
      pending: false,
      failure: null,
    });
  });

  it('ignores form actions while signed in, so a late response cannot drop the session', () => {
    const state: AuthState = { status: 'signedIn', user };
    expect(authReducer(state, { type: 'submitStarted' })).toBe(state);
    expect(
      authReducer(state, { type: 'submitFailed', failure: { kind: 'invalidCredentials' } }),
    ).toBe(state);
  });

  it('enters the app only after the gate succeeds', () => {
    const locked: AuthState = {
      status: 'locked',
      user,
      pending: false,
      failure: null,
      gateFailure: { kind: 'cancelled' },
    };
    expect(authReducer(locked, { type: 'unlocked', user })).toEqual({
      status: 'signedIn',
      user,
    });
  });

  it('treats password submit as pending while locked', () => {
    const locked: AuthState = {
      status: 'locked',
      user,
      pending: false,
      failure: null,
      gateFailure: { kind: 'cancelled' },
    };
    expect(authReducer(locked, { type: 'submitStarted' })).toEqual({
      status: 'locked',
      user,
      pending: true,
      failure: null,
      gateFailure: null,
    });
  });
});
