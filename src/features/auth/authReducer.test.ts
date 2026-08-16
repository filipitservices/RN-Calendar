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

const signedOut: AuthState = { status: 'signedOut', pending: false, failure: null };

describe('authReducer', () => {
  it('starts by restoring, so the sign-in screen never flashes at a signed-in user', () => {
    expect(initialAuthState).toEqual({ status: 'restoring' });
  });

  it('restores into signedIn when a session exists', () => {
    expect(authReducer(initialAuthState, { type: 'restored', user })).toEqual({
      status: 'signedIn',
      user,
    });
  });

  it('restores into signedOut when there is no session', () => {
    expect(authReducer(initialAuthState, { type: 'restored', user: null })).toEqual(signedOut);
  });

  it('marks a submission as pending and clears any previous failure', () => {
    const withFailure: AuthState = {
      status: 'signedOut',
      pending: false,
      failure: { kind: 'invalidCredentials' },
    };
    expect(authReducer(withFailure, { type: 'submitStarted' })).toEqual({
      status: 'signedOut',
      pending: true,
      failure: null,
    });
  });

  it('records a failure and stops pending', () => {
    const pending: AuthState = { status: 'signedOut', pending: true, failure: null };
    expect(authReducer(pending, { type: 'submitFailed', failure: { kind: 'invalidCredentials' } }))
      .toEqual({
        status: 'signedOut',
        pending: false,
        failure: { kind: 'invalidCredentials' },
      });
  });

  it('dismisses a failure without disturbing the pending flag', () => {
    const state: AuthState = {
      status: 'signedOut',
      pending: false,
      failure: { kind: 'emailAlreadyRegistered' },
    };
    expect(authReducer(state, { type: 'failureDismissed' })).toEqual(signedOut);
  });

  it('moves to signedIn on success', () => {
    const pending: AuthState = { status: 'signedOut', pending: true, failure: null };
    expect(authReducer(pending, { type: 'authenticated', user })).toEqual({
      status: 'signedIn',
      user,
    });
  });

  it('returns to a clean signedOut state on sign-out', () => {
    expect(authReducer({ status: 'signedIn', user }, { type: 'signedOut' })).toEqual(signedOut);
  });

  it('ignores form actions while signed in, so a late response cannot drop the session', () => {
    const state: AuthState = { status: 'signedIn', user };
    expect(authReducer(state, { type: 'submitStarted' })).toBe(state);
    expect(
      authReducer(state, { type: 'submitFailed', failure: { kind: 'invalidCredentials' } }),
    ).toBe(state);
    expect(authReducer(state, { type: 'failureDismissed' })).toBe(state);
  });

  it('never mutates the state it is given', () => {
    const state: AuthState = { status: 'signedOut', pending: false, failure: null };
    const next = authReducer(state, { type: 'submitStarted' });
    expect(next).not.toBe(state);
    expect(state).toEqual(signedOut);
  });

  it('holds on splash while the biometric gate runs', () => {
    expect(authReducer(initialAuthState, { type: 'unlockStarted', user })).toEqual({
      status: 'unlocking',
      user,
    });
  });

  it('enters the app only after the gate succeeds', () => {
    const unlocking: AuthState = { status: 'unlocking', user };
    expect(authReducer(unlocking, { type: 'unlocked', user })).toEqual({
      status: 'signedIn',
      user,
    });
  });

  it('falls back to sign-in without dropping the Firebase user', () => {
    const unlocking: AuthState = { status: 'unlocking', user };
    expect(authReducer(unlocking, { type: 'locked', user, gateFailure: { kind: 'cancelled' } })).toEqual({
      status: 'locked',
      user,
      pending: false,
      failure: null,
      gateFailure: { kind: 'cancelled' },
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
