/**
 * Identifier generator for locally created records. Combines a time prefix
 * (so ids sort roughly by creation) with random suffixes for collision
 * resistance. Sufficient for device-local data; a server would assign ids
 * itself once a backend exists.
 */
export const createId = (): string => {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${time}-${random}`;
};
