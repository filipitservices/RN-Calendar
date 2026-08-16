import { asUserId, initialsOf, normaliseEmail } from './user';
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
});

describe('initialsOf', () => {
  it('uses the first and last name', () => {
    expect(initialsOf(user())).toBe('AM');
  });

  it('falls back to the email when the name is blank', () => {
    expect(initialsOf(user({ displayName: '   ' }))).toBe('AL');
  });
});
