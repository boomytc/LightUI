import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkRecordedSource } from "./sample-check";
import { recordedSample } from "./recorded-sample";

const CHECK_IDS = [
  "json",
  "order",
  "initialHeight-complete",
  "placeholderMessages-complete",
  "css-complete",
  "html-complete",
  "jsFunctions-complete",
  "jsExpressions-complete",
  "generating-last",
  "js-functions-wait",
  "js-expressions-wait",
  "height-clamp",
  "send-prompt",
  "open-link",
  "unknown-field",
  "tamper-http",
  "tamper-extra",
];

describe("recorded sample", () => {
  const checks = checkRecordedSource(recordedSample.source);

  it("runs the shared checks", () => {
    assert.deepEqual(
      checks.map((check) => check.id),
      CHECK_IDS,
    );
  });

  for (const check of checks) {
    it(check.id, () => {
      assert.equal(check.ok, true, check.detail);
    });
  }
});
