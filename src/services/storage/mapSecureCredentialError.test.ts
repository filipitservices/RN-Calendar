import { mapSecureCredentialError } from './mapSecureCredentialError';

describe('mapSecureCredentialError', () => {
  it('maps cancellation without treating Android unavailable (1) as cancel', () => {
    expect(mapSecureCredentialError({ code: 'E_AUTH_CANCELED' }).kind).toBe('cancelled');
    expect(mapSecureCredentialError({ code: 10 }).kind).toBe('cancelled');
    expect(mapSecureCredentialError({ code: 1 }).kind).toBe('unavailable');
  });

  it('maps enrollment, lockout, and invalidation', () => {
    expect(mapSecureCredentialError({ code: 'E_BIOMETRIC_NOT_ENROLLED' }).kind).toBe('notEnrolled');
    expect(mapSecureCredentialError({ code: 7 }).kind).toBe('lockout');
    expect(mapSecureCredentialError({ message: 'Key permanently invalidated' }).kind).toBe(
      'invalidated',
    );
    expect(mapSecureCredentialError(new Error('nope')).kind).toBe('failed');
  });
});
