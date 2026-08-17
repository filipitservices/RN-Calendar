import type { SecureCredentialFailure } from './secureCredentialStore';

const numericCode = (raw: string): number | null => {
  const prefixed = raw.match(/\b(?:error[_\s-]?|code[_\s-]?)(\d+)\b/i);
  if (prefixed !== null) {
    return Number(prefixed[1]);
  }
  if (/^\d+$/.test(raw.trim())) {
    return Number(raw.trim());
  }
  return null;
};

const textOf = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) {
    return typeof error === 'string' ? error : '';
  }
  const record = error as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof record.code === 'string' || typeof record.code === 'number') {
    parts.push(String(record.code));
  }
  if (typeof record.message === 'string') {
    parts.push(record.message);
  }
  return parts.join(' ');
};

export const mapSecureCredentialError = (error: unknown): SecureCredentialFailure => {
  const raw = textOf(error);
  const lowered = raw.toLowerCase();
  const code = numericCode(raw);

  if (
    lowered.includes('e_auth_canceled') ||
    lowered.includes('usercancel') ||
    lowered.includes('user_canceled') ||
    lowered.includes('error_user_canceled') ||
    lowered.includes('error_canceled') ||
    lowered.includes('error_negative_button') ||
    code === 5 ||
    code === 10 ||
    code === 13
  ) {
    return { kind: 'cancelled' };
  }
  if (
    lowered.includes('e_biometric_not_enrolled') ||
    lowered.includes('not_enrolled') ||
    lowered.includes('none_enrolled') ||
    lowered.includes('error_no_biometrics') ||
    code === 11
  ) {
    return { kind: 'notEnrolled' };
  }
  if (lowered.includes('e_biometric_lockout') || lowered.includes('lockout') || code === 7 || code === 9) {
    return { kind: 'lockout' };
  }
  if (
    lowered.includes('invalidat') ||
    lowered.includes('aeadbadtag') ||
    lowered.includes('key permanently') ||
    lowered.includes('e_storage_access')
  ) {
    return { kind: 'invalidated' };
  }
  if (
    lowered.includes('e_biometric_unavailable') ||
    lowered.includes('hw_unavailable') ||
    lowered.includes('hw_not_present') ||
    lowered.includes('no_hardware') ||
    lowered.includes('error_hw') ||
    code === 1 ||
    code === 12
  ) {
    return { kind: 'unavailable' };
  }
  return { kind: 'failed' };
};
