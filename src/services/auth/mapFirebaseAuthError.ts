import type { AuthFailure } from './authService';

const withAuthPrefix = (code: string): string => (code.startsWith('auth/') ? code : `auth/${code}`);

/**
 * Maps a Firebase Auth error code onto the app's closed failure union so
 * screens never inspect vendor error objects.
 */
export const mapFirebaseAuthError = (code: string): AuthFailure => {
  switch (withAuthPrefix(code)) {
    case 'auth/email-already-in-use':
      return { kind: 'emailAlreadyRegistered' };
    case 'auth/weak-password':
      return { kind: 'weakPassword' };
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
    case 'auth/user-disabled':
      return { kind: 'invalidCredentials' };
    default:
      return { kind: 'unavailable' };
  }
};

export const firebaseAuthErrorCode = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }
  const code = error.code;
  return typeof code === 'string' && code.length > 0 ? code : null;
};
