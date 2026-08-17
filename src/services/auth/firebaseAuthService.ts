import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from '@react-native-firebase/auth';
import type { User as FirebaseUser } from '@react-native-firebase/auth';

import { asUserId, normaliseEmail } from '../../domain/auth/user';
import type { User } from '../../domain/auth/user';
import { err, ok } from '../../lib/result';
import type { AuthResult, AuthService } from './authService';
import { firebaseAuthErrorCode, mapFirebaseAuthError } from './mapFirebaseAuthError';

const toIsoInstant = (value: string | undefined): string => {
  if (value === undefined || value.length === 0) {
    return new Date().toISOString();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
};

const toAppUser = (firebaseUser: FirebaseUser): User | null => {
  const email = firebaseUser.email;
  if (email === null || email.length === 0) {
    return null;
  }
  const displayName = firebaseUser.displayName?.trim();
  return {
    id: asUserId(firebaseUser.uid),
    email,
    displayName: displayName !== undefined && displayName.length > 0 ? displayName : email,
    createdAt: toIsoInstant(firebaseUser.metadata.creationTime),
  };
};

const failureOf = (error: unknown): AuthResult => {
  const code = firebaseAuthErrorCode(error);
  return err(code === null ? { kind: 'unavailable' } : mapFirebaseAuthError(code));
};

/** Session persistence is the native SDK's. This module never stores passwords or tokens. */
export const createFirebaseAuthService = (): AuthService => {
  const auth = getAuth();

  return {
    subscribe(listener) {
      return onAuthStateChanged(auth, firebaseUser => {
        listener(firebaseUser === null ? null : toAppUser(firebaseUser));
      });
    },

    async register(registration): Promise<AuthResult> {
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          normaliseEmail(registration.email),
          registration.password,
        );
        const displayName = registration.displayName.trim();
        await updateProfile(credential.user, { displayName });
        return ok({
          id: asUserId(credential.user.uid),
          email: normaliseEmail(registration.email),
          displayName,
          createdAt: toIsoInstant(credential.user.metadata.creationTime),
        });
      } catch (error) {
        return failureOf(error);
      }
    },

    async signIn(credentials): Promise<AuthResult> {
      try {
        const credential = await signInWithEmailAndPassword(
          auth,
          normaliseEmail(credentials.email),
          credentials.password,
        );
        const user = toAppUser(credential.user);
        return user === null ? err({ kind: 'unavailable' }) : ok(user);
      } catch (error) {
        return failureOf(error);
      }
    },

    signOut: () => firebaseSignOut(auth),
  };
};
