import { mapSecureCredentialError } from './mapSecureCredentialError';

describe('mapSecureCredentialError', () => {
  it('maps cancellation, including Android user-canceled (10) without matching 1', () => {
    expect(mapSecureCredentialError({ code: 'E_AUTH_CANCELED' }).kind).toBe('cancelled');
    expect(mapSecureCredentialError({ code: 10 }).kind).toBe('cancelled');
    expect(mapSecureCredentialError({ message: 'ERROR_NEGATIVE_BUTTON' }).kind).toBe('cancelled');
  });

  it('maps missing enrollment', () => {
    expect(mapSecureCredentialError({ code: 'E_BIOMETRIC_NOT_ENROLLED' }).kind).toBe('notEnrolled');
    expect(mapSecureCredentialError({ code: 11 }).kind).toBe('notEnrolled');
  });

  it('maps lockout without treating cancel as lockout', () => {
    expect(mapSecureCredentialError({ code: 'E_BIOMETRIC_LOCKOUT' }).kind).toBe('lockout');
    expect(mapSecureCredentialError({ code: 7 }).kind).toBe('lockout');
  });

  it('maps enrollment changes and missing items as invalidated', () => {
    expect(mapSecureCredentialError({ message: 'Key permanently invalidated' }).kind).toBe(
      'invalidated',
    );
  });

  it('maps unavailable hardware', () => {
    expect(mapSecureCredentialError({ code: 'E_BIOMETRIC_UNAVAILABLE' }).kind).toBe('unavailable');
    expect(mapSecureCredentialError({ code: 1 }).kind).toBe('unavailable');
    expect(mapSecureCredentialError({ code: 12 }).kind).toBe('unavailable');
  });

  it('falls back to failed for unknown errors', () => {
    expect(mapSecureCredentialError(new Error('nope')).kind).toBe('failed');
  });
});
