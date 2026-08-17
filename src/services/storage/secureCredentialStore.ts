import type { Result } from '../../lib/result';

export type AuthPrompt = {
  readonly title: string;
  readonly description: string;
  readonly cancel: string;
};

export type SecureCredential = {
  readonly username: string;
  readonly secret: string;
};

export type SecureCredentialFailure =
  | { kind: 'cancelled' }
  | { kind: 'notEnrolled' }
  | { kind: 'unavailable' }
  | { kind: 'lockout' }
  | { kind: 'invalidated' }
  | { kind: 'failed' };

export type SecureCredentialResult<T> = Result<T, SecureCredentialFailure>;

export type SupportedBiometry = 'fingerprint' | 'face' | 'iris' | 'none' | 'notEnrolled';

/**
 * OS-backed credential storage. Implementations must use Keychain/Keystore,
 * never MMKV. `has` and `remove` must not present a biometric prompt.
 */
export type SecureCredentialStore = {
  has(): Promise<boolean>;
  set(
    username: string,
    secret: string,
    prompt: AuthPrompt,
  ): Promise<SecureCredentialResult<void>>;
  get(prompt: AuthPrompt): Promise<SecureCredentialResult<SecureCredential>>;
  remove(): Promise<void>;
  supportedBiometry(): Promise<SupportedBiometry>;
};
