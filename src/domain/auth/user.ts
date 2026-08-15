export type UserId = string & { readonly __brand: 'UserId' };

export const asUserId = (value: string): UserId => value as UserId;

export type User = {
  readonly id: UserId;
  readonly email: string;
  readonly displayName: string;
  readonly createdAt: string;
};

export type Credentials = {
  readonly email: string;
  readonly password: string;
};

export type Registration = Credentials & {
  readonly displayName: string;
};

/**
 * Emails are compared case-insensitively and stored normalised, so
 * `User@Example.com` and `user@example.com` are the same account.
 */
export const normaliseEmail = (email: string): string => email.trim().toLowerCase();

/** Initials for the profile avatar, derived rather than stored. */
export const initialsOf = (user: User): string => {
  const words = user.displayName.trim().split(/\s+/).filter(word => word.length > 0);
  // Keeps the first and last word; for a single-word name both indices are the
  // same element, so it contributes one letter.
  const initials = words
    .filter((_word, index) => index === 0 || index === words.length - 1)
    .map(word => word.charAt(0))
    .join('');

  return initials.length > 0 ? initials.toUpperCase() : user.email.slice(0, 2).toUpperCase();
};

export const decodeUser = (value: unknown): User | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    record.id.length === 0 ||
    typeof record.email !== 'string' ||
    typeof record.displayName !== 'string' ||
    typeof record.createdAt !== 'string'
  ) {
    return null;
  }
  return {
    id: asUserId(record.id),
    email: record.email,
    displayName: record.displayName,
    createdAt: record.createdAt,
  };
};
