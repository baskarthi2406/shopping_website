import "server-only";

/**
 * In-memory catalog snapshot (ADR 0009 principle 6). Readers never wait on
 * the provider while a snapshot younger than `maxAgeMs` exists: once it is
 * older than `refreshIntervalMs`, one background refresh starts and readers
 * keep the current snapshot. Without a usable snapshot, readers wait for one
 * shared refresh. Failed refreshes keep the previous snapshot and are not
 * retried before `failureBackoffMs`. A snapshot older than `maxAgeMs` is never
 * served. State is per server process; durable storage needs ADR 0008.
 */
export type CatalogSnapshotLoader<T> = () => Promise<T>;

export type CatalogSnapshotStoreOptions<T> = {
  readonly load: CatalogSnapshotLoader<T>;
  readonly refreshIntervalMs: number;
  readonly maxAgeMs: number;
  readonly failureBackoffMs: number;
  readonly now?: () => number;
  /** Receives refresh failures; must not log secrets. */
  readonly onRefreshError?: (error: unknown) => void;
};

export type CatalogSnapshotStore<T> = {
  get(): Promise<T>;
};

export class CatalogSnapshotUnavailableError extends Error {
  constructor() {
    super("Catalog snapshot is unavailable");
    this.name = "CatalogSnapshotUnavailableError";
  }
}

type Snapshot<T> = { readonly value: T; readonly fetchedAt: number };

export function createCatalogSnapshotStore<T>(
  options: CatalogSnapshotStoreOptions<T>,
): CatalogSnapshotStore<T> {
  const { load, refreshIntervalMs, maxAgeMs, failureBackoffMs, now = Date.now } = options;
  const onRefreshError = options.onRefreshError ?? (() => {});
  if (!(refreshIntervalMs > 0 && refreshIntervalMs < maxAgeMs && failureBackoffMs >= 0)) {
    throw new RangeError("refreshIntervalMs must be positive and below maxAgeMs");
  }

  let current: Snapshot<T> | null = null;
  let pending: Promise<Snapshot<T>> | null = null;
  let lastFailureAt: number | null = null;

  function refresh(): Promise<Snapshot<T>> {
    pending ??= (async () => {
      const startedAt = now();
      const value = await load();
      current = { value, fetchedAt: startedAt };
      lastFailureAt = null;
      return current;
    })()
      .catch((error: unknown) => {
        lastFailureAt = now();
        onRefreshError(error);
        throw error;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  }

  function mayAttempt(): boolean {
    return lastFailureAt === null || now() - lastFailureAt >= failureBackoffMs;
  }

  return {
    async get() {
      if (current !== null) {
        const age = now() - current.fetchedAt;
        if (age < maxAgeMs) {
          if (age >= refreshIntervalMs && pending === null && mayAttempt()) {
            refresh().catch(() => {});
          }
          return current.value;
        }
      }
      if (pending === null && !mayAttempt()) {
        throw new CatalogSnapshotUnavailableError();
      }
      try {
        return (await refresh()).value;
      } catch {
        throw new CatalogSnapshotUnavailableError();
      }
    },
  };
}
