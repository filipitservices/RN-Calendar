import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { Credentials, Registration, User } from '../../domain/auth/user';
import type { AuthFailure, AuthService } from '../../services/auth/authService';
import type { BiometricCapability, BiometricUnlockService } from '../../services/biometrics/biometricUnlockService';
import type { SecureCredentialFailure } from '../../services/storage/secureCredentialStore';
import { authReducer, initialAuthState } from './authReducer';
import type { AuthState } from './authReducer';

export type AuthContextValue = {
  state: AuthState;
  lastEmail: string;
  biometricCapability: BiometricCapability;
  biometricsEnabled: boolean;
  biometricBusy: boolean;
  register: (registration: Registration) => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  dismissFailure: () => void;
  unlockWithBiometrics: () => Promise<void>;
  enableBiometrics: () => Promise<SecureCredentialFailure | null>;
  disableBiometrics: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  service: AuthService;
  biometricUnlock: BiometricUnlockService;
  children: ReactNode;
};

export const AuthProvider = ({ service, biometricUnlock, children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [lastEmail, setLastEmail] = useState('');
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability>({
    status: 'unavailable',
  });
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const skipGateRef = useRef(false);
  const generationRef = useRef(0);

  useEffect(() => {
    void biometricUnlock.lastEmail().then(email => {
      if (email !== null) {
        setLastEmail(email);
      }
    });
    void biometricUnlock.capability().then(setBiometricCapability);
  }, [biometricUnlock]);

  const applyAuthenticated = useCallback(
    async (user: { id: string; email: string }) => {
      skipGateRef.current = true;
      await biometricUnlock.clearIfUserMismatch(user.id);
      await biometricUnlock.rememberEmail(user.email);
      setLastEmail(user.email);
      setBiometricsEnabled(await biometricUnlock.isConfiguredFor(user.id));
    },
    [biometricUnlock],
  );

  const runGate = useCallback(
    async (user: User) => {
      const generation = generationRef.current;
      // Stay on Sign-in while the system prompt is up. Going to `unlocking`
      // unmounts that screen under BiometricPrompt and Fabric loses view tags.
      const result = await biometricUnlock.authenticate();
      if (generation !== generationRef.current) {
        return;
      }
      if (result.ok && result.value === user.id) {
        setBiometricsEnabled(true);
        dispatch({ type: 'unlocked', user });
        return;
      }
      const gateFailure = result.ok ? { kind: 'invalidated' as const } : result.error;
      if (gateFailure.kind === 'invalidated' || gateFailure.kind === 'unavailable' || gateFailure.kind === 'notEnrolled') {
        await biometricUnlock.disable();
        setBiometricsEnabled(false);
      }
      dispatch({ type: 'locked', user, gateFailure });
    },
    [biometricUnlock],
  );

  useEffect(() => {
    return service.subscribe(user => {
      generationRef.current += 1;
      const generation = generationRef.current;

      if (user === null) {
        skipGateRef.current = false;
        setBiometricsEnabled(false);
        dispatch({ type: 'restored', user: null });
        return;
      }

      const current = stateRef.current;
      if (
        (current.status === 'signedIn' || current.status === 'locked' || current.status === 'unlocking') &&
        current.user.id === user.id
      ) {
        return;
      }

      void (async () => {
        if (skipGateRef.current) {
          await applyAuthenticated(user);
          if (generation !== generationRef.current) {
            return;
          }
          dispatch({ type: 'restored', user });
          return;
        }

        await biometricUnlock.clearIfUserMismatch(user.id);
        const needsGate = await biometricUnlock.isConfiguredFor(user.id);
        if (generation !== generationRef.current) {
          return;
        }
        setBiometricsEnabled(needsGate);
        if (!needsGate) {
          dispatch({ type: 'restored', user });
          return;
        }
        dispatch({ type: 'locked', user, gateFailure: null });
      })();
    });
  }, [applyAuthenticated, biometricUnlock, service]);

  const register = useCallback(
    async (registration: Registration) => {
      dispatch({ type: 'submitStarted' });
      skipGateRef.current = true;
      const result = await service.register(registration);
      if (result.ok) {
        await applyAuthenticated(result.value);
        dispatch({ type: 'authenticated', user: result.value });
      } else {
        skipGateRef.current = false;
        dispatch({ type: 'submitFailed', failure: result.error });
      }
    },
    [applyAuthenticated, service],
  );

  const signIn = useCallback(
    async (credentials: Credentials) => {
      dispatch({ type: 'submitStarted' });
      skipGateRef.current = true;
      const result = await service.signIn(credentials);
      if (result.ok) {
        await applyAuthenticated(result.value);
        dispatch({ type: 'authenticated', user: result.value });
      } else {
        skipGateRef.current = false;
        dispatch({ type: 'submitFailed', failure: result.error });
      }
    },
    [applyAuthenticated, service],
  );

  const signOut = useCallback(async () => {
    skipGateRef.current = false;
    generationRef.current += 1;
    await biometricUnlock.disable();
    setBiometricsEnabled(false);
    await service.signOut();
  }, [biometricUnlock, service]);

  const dismissFailure = useCallback(() => dispatch({ type: 'failureDismissed' }), []);

  const unlockWithBiometrics = useCallback(async () => {
    const current = stateRef.current;
    if (current.status !== 'locked') {
      return;
    }
    await runGate(current.user);
  }, [runGate]);

  const enableBiometrics = useCallback(async (): Promise<SecureCredentialFailure | null> => {
    const current = stateRef.current;
    if (current.status !== 'signedIn') {
      return { kind: 'failed' };
    }
    setBiometricBusy(true);
    const result = await biometricUnlock.enable(current.user.id);
    setBiometricBusy(false);
    if (result.ok) {
      setBiometricsEnabled(true);
      return null;
    }
    if (result.error.kind === 'notEnrolled') {
      setBiometricCapability({ status: 'notEnrolled' });
    }
    return result.error;
  }, [biometricUnlock]);

  const disableBiometrics = useCallback(async () => {
    setBiometricBusy(true);
    await biometricUnlock.disable();
    setBiometricsEnabled(false);
    setBiometricBusy(false);
  }, [biometricUnlock]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      lastEmail,
      biometricCapability,
      biometricsEnabled,
      biometricBusy,
      register,
      signIn,
      signOut,
      dismissFailure,
      unlockWithBiometrics,
      enableBiometrics,
      disableBiometrics,
    }),
    [
      state,
      lastEmail,
      biometricCapability,
      biometricsEnabled,
      biometricBusy,
      register,
      signIn,
      signOut,
      dismissFailure,
      unlockWithBiometrics,
      enableBiometrics,
      disableBiometrics,
    ],
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

export const biometricFailureMessage = (failure: SecureCredentialFailure): string => {
  switch (failure.kind) {
    case 'cancelled':
      return 'Biometric sign-in was cancelled. You can use your password instead.';
    case 'notEnrolled':
      return 'No fingerprint or face is enrolled on this device.';
    case 'unavailable':
      return 'Biometric sign-in is not available on this device.';
    case 'lockout':
      return 'Too many attempts. Use your password, then try biometrics again later.';
    case 'invalidated':
      return 'Biometric sign-in is no longer valid. Sign in with your password to set it up again.';
    case 'failed':
      return 'Could not verify it was you. Use your password instead.';
  }
};
