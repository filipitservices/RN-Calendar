import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
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
    expect(validateEmail(`${'a'.repeat(EMAIL_MAX_LENGTH)}@x.co`)).toBeDefined();
  });
});

describe('validateSignIn', () => {
  it('accepts any non-empty password within the Auth length bound', () => {
    expect(validateSignIn({ email: 'user@example.com', password: 'a' })).toEqual({});
    expect(
      validateSignIn({ email: 'user@example.com', password: 'a'.repeat(PASSWORD_MAX_LENGTH + 1) })
        .password,
    ).toBeDefined();
    const errors = validateSignIn({ email: '', password: '' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe('validateRegistration', () => {
  const valid = {
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    password: 'abcdef',
  };

  it('accepts a well-formed registration and rejects blank names or short passwords', () => {
    expect(validateRegistration(valid)).toEqual({});
    expect(validateRegistration({ ...valid, displayName: '   ' }).displayName).toBeDefined();
    expect(validateRegistration({ ...valid, displayName: 'Alex <script>' }).displayName).toBeDefined();
    expect(validateRegistration({ ...valid, displayName: "José O'Brien-Smith" }).displayName).toBeUndefined();
    expect(validateRegistration({ ...valid, password: 'abcde' }).password).toBeDefined();
    expect(
      validateRegistration({ ...valid, password: 'a'.repeat(PASSWORD_MIN_LENGTH) }).password,
    ).toBeUndefined();
  });
});

describe('hasErrors', () => {
  it('ignores keys explicitly set to undefined', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: undefined })).toBe(false);
    expect(hasErrors({ email: 'Enter your email address.' })).toBe(true);
  });
});
