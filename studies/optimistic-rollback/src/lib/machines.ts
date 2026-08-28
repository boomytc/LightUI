import type { ActionKind, SyncPhase } from "./kinds";

export function isOptimisticAllowed(kind: ActionKind): boolean {
  return kind !== "delete";
}

export type OptimisticRecord<T> = {
  current: T;
  snapshot: T;
  phase: SyncPhase;
  token: number;
};

export function createOptimisticRecord<T>(initialValue: T): OptimisticRecord<T> {
  return {
    current: initialValue,
    snapshot: initialValue,
    phase: "idle",
    token: 0,
  };
}

export function applyOptimisticTrigger<T>(
  record: OptimisticRecord<T>,
  nextValue: T,
  kind: ActionKind = "like",
): OptimisticRecord<T> {
  const nextToken = record.token + 1;
  if (!isOptimisticAllowed(kind)) {
    // For non-optimistic kinds, keep current value until confirmed, but set phase syncing
    return {
      current: record.current,
      snapshot: record.current,
      phase: "syncing",
      token: nextToken,
    };
  }
  return {
    current: nextValue,
    snapshot: record.current,
    phase: "syncing",
    token: nextToken,
  };
}

export function commitOptimisticSuccess<T>(
  record: OptimisticRecord<T>,
  token: number,
  confirmedValue?: T,
): OptimisticRecord<T> {
  // If token is stale, ignore
  if (token !== record.token) return record;

  return {
    current: confirmedValue !== undefined ? confirmedValue : record.current,
    snapshot: confirmedValue !== undefined ? confirmedValue : record.current,
    phase: "synced",
    token: record.token,
  };
}

export function rollbackOptimisticFailure<T>(
  record: OptimisticRecord<T>,
  token: number,
): OptimisticRecord<T> {
  // If token is stale, ignore
  if (token !== record.token) return record;

  return {
    current: record.snapshot,
    snapshot: record.snapshot,
    phase: "error",
    token: record.token,
  };
}

export function settleToIdle<T>(record: OptimisticRecord<T>, token: number): OptimisticRecord<T> {
  if (token !== record.token) return record;
  return {
    ...record,
    phase: "idle",
  };
}
