import { err, ok } from '../../lib/result';
import type { Result } from '../../lib/result';
import type {
  AuthPrompt,
  SecureCredential,
  SecureCredentialFailure,
  SecureCredentialStore,
  SupportedBiometry,
} from '../../services/storage/secureCredentialStore';

export type MemorySecureCredentialOptions = {
  biometry?: SupportedBiometry;
  onSet?: () => Result<void, SecureCredentialFailure>;
  onGet?: () => Result<SecureCredential, SecureCredentialFailure>;
};

/**
 * In-memory Keychain stand-in for tests. Does not prompt.
 */
export const createMemorySecureCredentialStore = (
  options: MemorySecureCredentialOptions = {},
): SecureCredentialStore => {
  let item: SecureCredential | null = null;
  const biometry = options.biometry ?? 'none';

  return {
    has: () => Promise.resolve(item !== null),

    async set(username, secret, _prompt: AuthPrompt) {
      if (options.onSet !== undefined) {
        const blocked = options.onSet();
        if (!blocked.ok) {
          return blocked;
        }
      }
      if (biometry === 'none') {
        return err({ kind: 'unavailable' });
      }
      if (biometry === 'notEnrolled') {
        return err({ kind: 'notEnrolled' });
      }
      item = { username, secret };
      return ok(undefined);
    },

    async get(_prompt: AuthPrompt) {
      if (options.onGet !== undefined) {
        return options.onGet();
      }
      if (item === null) {
        return err({ kind: 'invalidated' });
      }
      return ok(item);
    },

    async remove() {
      item = null;
    },

    supportedBiometry: () => Promise.resolve(biometry),
  };
};
