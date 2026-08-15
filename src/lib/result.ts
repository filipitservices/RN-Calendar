/**
 * Result type for operations whose failures are expected outcomes (invalid
 * credentials, validation errors) rather than programmer error. Throwing is
 * reserved for bugs.
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/** Exhaustiveness guard for discriminated unions. */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
};
