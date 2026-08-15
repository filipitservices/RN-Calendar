import type { Credentials, Registration } from './user';

export const PASSWORD_MIN_LENGTH = 8;
export const DISPLAY_NAME_MAX_LENGTH = 60;

/**
 * Pragmatic email check: a single `@`, a non-empty local part, and a dotted
 * domain with a plausible TLD. Deliberately not RFC 5322 — an over-strict
 * regex rejects valid addresses, and only a real send can truly verify one.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export type SignInFieldErrors = {
  readonly email?: string;
  readonly password?: string;
};

export type RegistrationFieldErrors = SignInFieldErrors & {
  readonly displayName?: string;
};

export const validateEmail = (email: string): string | undefined => {
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return 'Enter your email address.';
  }
  return EMAIL_PATTERN.test(trimmed) ? undefined : 'Enter a valid email address.';
};

/** Sign-in only checks that a password was typed; strength rules apply at registration. */
const validatePasswordPresence = (password: string): string | undefined =>
  password.length === 0 ? 'Enter your password.' : undefined;

const validatePasswordStrength = (password: string): string | undefined => {
  if (password.length === 0) {
    return 'Choose a password.';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  return undefined;
};

export const validateSignIn = (credentials: Credentials): SignInFieldErrors => {
  const errors: { email?: string; password?: string } = {};
  const email = validateEmail(credentials.email);
  if (email !== undefined) {
    errors.email = email;
  }
  const password = validatePasswordPresence(credentials.password);
  if (password !== undefined) {
    errors.password = password;
  }
  return errors;
};

export const validateRegistration = (registration: Registration): RegistrationFieldErrors => {
  const errors: { email?: string; password?: string; displayName?: string } = {};

  const name = registration.displayName.trim();
  if (name.length === 0) {
    errors.displayName = 'Enter your name.';
  } else if (name.length > DISPLAY_NAME_MAX_LENGTH) {
    errors.displayName = `Keep your name under ${DISPLAY_NAME_MAX_LENGTH} characters.`;
  }

  const email = validateEmail(registration.email);
  if (email !== undefined) {
    errors.email = email;
  }

  const password = validatePasswordStrength(registration.password);
  if (password !== undefined) {
    errors.password = password;
  }

  return errors;
};

export const hasErrors = (errors: Record<string, string | undefined>): boolean =>
  Object.values(errors).some(value => value !== undefined);
