import { firebaseAuthErrorCode, mapFirebaseAuthError } from './mapFirebaseAuthError';

describe('mapFirebaseAuthError', () => {
  it('collapses credential failures so accounts are not enumerable', () => {
    expect(mapFirebaseAuthError('auth/invalid-credential').kind).toBe('invalidCredentials');
    expect(mapFirebaseAuthError('auth/wrong-password').kind).toBe('invalidCredentials');
    expect(mapFirebaseAuthError('auth/user-not-found').kind).toBe('invalidCredentials');
  });

  it('maps an already-registered email, with or without the auth/ prefix', () => {
    expect(mapFirebaseAuthError('auth/email-already-in-use')).toEqual({
      kind: 'emailAlreadyRegistered',
    });
    expect(mapFirebaseAuthError('email-already-in-use')).toEqual({
      kind: 'emailAlreadyRegistered',
    });
    expect(mapFirebaseAuthError('auth/weak-password')).toEqual({ kind: 'weakPassword' });
  });

  it('treats network and unknown codes as unavailable', () => {
    expect(mapFirebaseAuthError('auth/network-request-failed')).toEqual({ kind: 'unavailable' });
    expect(mapFirebaseAuthError('something-else')).toEqual({ kind: 'unavailable' });
    expect(firebaseAuthErrorCode(new Error('nope'))).toBeNull();
  });
});
