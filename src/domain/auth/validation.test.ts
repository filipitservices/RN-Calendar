import {
  PASSWORD_MIN_LENGTH,
  hasErrors,
  validateEmail,
  validateRegistration,
  validateSignIn,
} from './validation';

describe('validateEmail', () => {
  it('accepts a plausible address and rejects empty or malformed ones', () => {
    expect(validateEmail('user@example.com')).toBeUndefined();
    expect(validateEmail('  user+tag@example.co.uk  ')).toBeUndefined();
    expect(validateEmail('')).toBe('Enter your email address.');
    expect(validateEmail('user@example')).toBe('Enter a valid email address.');
  });
});

describe('validateSignIn', () => {
  it('accepts any non-empty password and reports both empty fields at once', () => {
    expect(validateSignIn({ email: 'user@example.com', password: 'a' })).toEqual({});
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

  it('accepts a well-formed registration and rejects weak names or passwords', () => {
    expect(validateRegistration(valid)).toEqual({});
    expect(validateRegistration({ ...valid, displayName: '   ' }).displayName).toBeDefined();
    expect(validateRegistration({ ...valid, password: 'cal1' }).password).toBeDefined();
    expect(
      validateRegistration({ ...valid, password: 'a'.repeat(PASSWORD_MIN_LENGTH) }).password,
    ).toBeDefined();
  });
});

describe('hasErrors', () => {
  it('ignores keys explicitly set to undefined', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: undefined })).toBe(false);
    expect(hasErrors({ email: 'Enter your email address.' })).toBe(true);
  });
});
