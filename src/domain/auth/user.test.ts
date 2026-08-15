import { asUserId, decodeUser, initialsOf, normaliseEmail } from './user';
import type { User } from './user';

const user = (overrides: Partial<User> = {}): User => ({
  id: asUserId('u1'),
  email: 'alex@example.com',
  displayName: 'Alex Morgan',
  createdAt: '2026-08-01T10:00:00.000Z',
  ...overrides,
});

describe('normaliseEmail', () => {
  it('lowercases and trims so an address maps to one account', () => {
    expect(normaliseEmail('  Alex@Example.COM ')).toBe('alex@example.com');
  });

  it('leaves an already-normalised address alone', () => {
    expect(normaliseEmail('alex@example.com')).toBe('alex@example.com');
  });
});

describe('initialsOf', () => {
  it('uses the first and last name', () => {
    expect(initialsOf(user())).toBe('AM');
  });

  it('uses a single initial for a one-word name', () => {
    expect(initialsOf(user({ displayName: 'Alex' }))).toBe('A');
  });

  it('skips the middle names', () => {
    expect(initialsOf(user({ displayName: 'Alex James Morgan' }))).toBe('AM');
  });

  it('ignores extra whitespace between names', () => {
    expect(initialsOf(user({ displayName: '  Alex   Morgan  ' }))).toBe('AM');
  });

  it('falls back to the email when the name is blank', () => {
    expect(initialsOf(user({ displayName: '   ' }))).toBe('AL');
  });
});

describe('decodeUser', () => {
  const raw = {
    id: 'u1',
    email: 'alex@example.com',
    displayName: 'Alex Morgan',
    createdAt: '2026-08-01T10:00:00.000Z',
  };

  it('decodes a well-formed record', () => {
    expect(decodeUser(raw)).toEqual(user());
  });

  it.each([
    ['an empty id', { id: '' }],
    ['a missing id', { id: undefined }],
    ['a non-string email', { email: 42 }],
    ['a missing display name', { displayName: null }],
    ['a missing createdAt', { createdAt: undefined }],
  ])('rejects %s rather than trusting it', (_label, override) => {
    expect(decodeUser({ ...raw, ...override })).toBeNull();
  });

  it.each([null, undefined, 'string', 42])('rejects non-object %p', value => {
    expect(decodeUser(value)).toBeNull();
  });
});
