import test from "node:test";
import assert from "node:assert/strict";
import {
  isOptimisticAllowed,
  createOptimisticRecord,
  applyOptimisticTrigger,
  commitOptimisticSuccess,
  rollbackOptimisticFailure,
  settleToIdle,
} from "./machines";

test("isOptimisticAllowed forbids high-risk irreversible operations", () => {
  assert.equal(isOptimisticAllowed("like"), true);
  assert.equal(isOptimisticAllowed("bookmark"), true);
  assert.equal(isOptimisticAllowed("follow"), true);
  assert.equal(isOptimisticAllowed("delete"), false);
});

test("applyOptimisticTrigger updates current immediately and preserves snapshot", () => {
  const initial = createOptimisticRecord(false);
  const next = applyOptimisticTrigger(initial, true, "like");

  assert.equal(next.current, true);
  assert.equal(next.snapshot, false);
  assert.equal(next.phase, "syncing");
  assert.equal(next.token, 1);
});

test("rollbackOptimisticFailure restores snapshot upon error", () => {
  const initial = createOptimisticRecord(false);
  const active = applyOptimisticTrigger(initial, true, "like");
  const failed = rollbackOptimisticFailure(active, active.token);

  assert.equal(failed.current, false);
  assert.equal(failed.snapshot, false);
  assert.equal(failed.phase, "error");
});

test("stale tokens are ignored during commit or rollback", () => {
  const initial = createOptimisticRecord(false);
  const first = applyOptimisticTrigger(initial, true, "like");
  const second = applyOptimisticTrigger(first, false, "like"); // token 2

  // Stale token 1 arrives with error
  const afterStaleError = rollbackOptimisticFailure(second, first.token);
  assert.equal(afterStaleError.current, false);
  assert.equal(afterStaleError.token, 2);
  assert.equal(afterStaleError.phase, "syncing");

  // Stale token 1 arrives with success
  const afterStaleSuccess = commitOptimisticSuccess(second, first.token);
  assert.equal(afterStaleSuccess.token, 2);
  assert.equal(afterStaleSuccess.phase, "syncing");

  // Valid token 2 arrives
  const confirmed = commitOptimisticSuccess(second, second.token);
  assert.equal(confirmed.phase, "synced");
  assert.equal(confirmed.current, false);
});

test("settleToIdle transitions state to idle when token matches", () => {
  const initial = createOptimisticRecord(false);
  const active = applyOptimisticTrigger(initial, true, "like");
  const synced = commitOptimisticSuccess(active, active.token);
  const settled = settleToIdle(synced, active.token);

  assert.equal(settled.phase, "idle");
});

test("delete action does not flip current state optimistically", () => {
  const initial = createOptimisticRecord(true);
  const next = applyOptimisticTrigger(initial, false, "delete");

  assert.equal(next.current, true);
  assert.equal(next.phase, "syncing");
});
