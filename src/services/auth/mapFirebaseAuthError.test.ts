import { firebaseAuthErrorCode, mapFirebaseAuthError } from './mapFirebaseAuthError';

describe('mapFirebaseAuthError', () => {
  it('maps an already-registered email', () => {
    expect(mapFirebaseAuthError('auth/email-already-in-use')).toEqual({
      kind: 'emailAlreadyRegistered',
    });
  });

  it('accepts codes without the auth/ prefix', () => {
    expect(mapFirebaseAuthError('email-already-in-use')).toEqual({
      kind: 'emailAlreadyRegistered',
    });
  });

  it('collapses credential failures so accounts are not enumerable', () => {
    expect(mapFirebaseAuthError('auth/invalid-credential').kind).toBe('invalidCredentials');
    expect(mapFirebaseAuthError('auth/wrong-password').kind).toBe('invalidCredentials');
    expect(mapFirebaseAuthError('auth/user-not-found').kind).toBe('invalidCredentials');
  });

  it('treats network and unknown codes as unavailable', () => {
    expect(mapFirebaseAuthError('auth/network-request-failed')).toEqual({ kind: 'unavailable' });
    expect(mapFirebaseAuthError('auth/too-many-requests')).toEqual({ kind: 'unavailable' });
    expect(mapFirebaseAuthError('something-else')).toEqual({ kind: 'unavailable' });
  });

  it('reads a code off an error object and ignores anything else', () => {
    expect(firebaseAuthErrorCode({ code: 'auth/invalid-credential' })).toBe(
      'auth/invalid-credential',
    );
    expect(firebaseAuthErrorCode(new Error('nope'))).toBeNull();
    expect(firebaseAuthErrorCode({ code: '' })).toBeNull();
  });
});
