import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';

import type { Credentials, Registration } from '../../domain/auth/user';
import type { AuthFailure, AuthService } from '../../services/auth/authService';
import { authReducer, initialAuthState } from './authReducer';
import type { AuthState } from './authReducer';

export type AuthContextValue = {
  state: AuthState;
  register: (registration: Registration) => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  dismissFailure: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  service: AuthService;
  children: ReactNode;
};

/**
 * The single owner of session state. Nothing else stores whether a user is
 * signed in, and no screen talks to `AuthService` directly.
 */
export const AuthProvider = ({ service, children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    return service.subscribe(user => {
      dispatch({ type: 'restored', user });
    });
  }, [service]);

  const register = useCallback(
    async (registration: Registration) => {
      dispatch({ type: 'submitStarted' });
      const result = await service.register(registration);
      if (result.ok) {
        dispatch({ type: 'authenticated', user: result.value });
      } else {
        dispatch({ type: 'submitFailed', failure: result.error });
      }
    },
    [service],
  );

  const signIn = useCallback(
    async (credentials: Credentials) => {
      dispatch({ type: 'submitStarted' });
      const result = await service.signIn(credentials);
      if (result.ok) {
        dispatch({ type: 'authenticated', user: result.value });
      } else {
        dispatch({ type: 'submitFailed', failure: result.error });
      }
    },
    [service],
  );

  const signOut = useCallback(async () => {
    await service.signOut();
  }, [service]);

  const dismissFailure = useCallback(() => dispatch({ type: 'failureDismissed' }), []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, register, signIn, signOut, dismissFailure }),
    [state, register, signIn, signOut, dismissFailure],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return value;
};

/**
 * The authenticated user, for screens that only render inside the signed-in
 * part of the navigator. Throwing here is correct: reaching this state without
 * a user would be a navigation bug, not a runtime condition to handle.
 */
export const useAuthenticatedUser = () => {
  const { state } = useAuth();
  if (state.status !== 'signedIn') {
    throw new Error('useAuthenticatedUser used outside the authenticated navigator');
  }
  return state.user;
};

export const authFailureMessage = (failure: AuthFailure): string => {
  switch (failure.kind) {
    case 'invalidCredentials':
      return 'That email and password combination does not match an account.';
    case 'emailAlreadyRegistered':
      return 'An account already exists for that email address.';
    case 'unavailable':
      return 'Could not reach the authentication service. Please try again.';
  }
};
