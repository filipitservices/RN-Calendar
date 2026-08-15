import {
  PASSWORD_MIN_LENGTH,
  hasErrors,
  validateEmail,
  validateRegistration,
  validateSignIn,
} from './validation';

describe('validateEmail', () => {
  it.each([
    'user@example.com',
    'first.last@example.co.uk',
    'user+tag@example.io',
    'u@a.bc',
  ])('accepts %p', email => {
    expect(validateEmail(email)).toBeUndefined();
  });

  it.each([
    'user@example',
    'user@@example.com',
    'user example.com',
    '@example.com',
    'user@.com',
    'user@example.',
  ])('rejects %p', email => {
    expect(validateEmail(email)).toBeDefined();
  });

  it('distinguishes an empty field from a malformed one', () => {
    expect(validateEmail('')).toBe('Enter your email address.');
    expect(validateEmail('nope')).toBe('Enter a valid email address.');
  });

  it('ignores surrounding whitespace', () => {
    expect(validateEmail('  user@example.com  ')).toBeUndefined();
  });
});

describe('validateSignIn', () => {
  it('accepts any non-empty password, since strength rules belong to registration', () => {
    expect(validateSignIn({ email: 'user@example.com', password: 'a' })).toEqual({});
  });

  it('reports both fields at once', () => {
    const errors = validateSignIn({ email: '', password: '' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe('validateRegistration', () => {
  const valid = {
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    password: 'calendar1',
  };

  it('accepts a well-formed registration', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('requires a name', () => {
    expect(validateRegistration({ ...valid, displayName: '   ' }).displayName).toBeDefined();
  });

  it(`requires at least ${PASSWORD_MIN_LENGTH} characters`, () => {
    expect(validateRegistration({ ...valid, password: 'cal1' }).password).toBeDefined();
  });

  it('requires both a letter and a number', () => {
    expect(validateRegistration({ ...valid, password: '12345678' }).password).toBeDefined();
    expect(validateRegistration({ ...valid, password: 'abcdefgh' }).password).toBeDefined();
  });

  it('rejects an over-long name', () => {
    expect(validateRegistration({ ...valid, displayName: 'a'.repeat(61) }).displayName).toBeDefined();
  });
});

describe('hasErrors', () => {
  it('ignores keys explicitly set to undefined', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: undefined })).toBe(false);
    expect(hasErrors({ email: 'Enter your email address.' })).toBe(true);
  });
});
