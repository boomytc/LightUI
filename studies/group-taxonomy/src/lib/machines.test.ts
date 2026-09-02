import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPatternId,
  nextPattern,
  prevPattern,
  gradeQuizAnswer,
  PATTERN_IDS,
  PATTERNS,
  PATTERN_MAP,
  QUIZ,
} from "./machines.js";

describe("group-taxonomy machines", () => {
  it("validates pattern IDs correctly", () => {
    assert.equal(isPatternId("overview"), true);
    assert.equal(isPatternId("cards"), true);
    assert.equal(isPatternId("whitespace"), true);
    assert.equal(isPatternId("form"), true);
    assert.equal(isPatternId("list"), true);
    assert.equal(isPatternId("bands"), true);
    assert.equal(isPatternId("compare"), true);
    assert.equal(isPatternId("invalid-slug"), false);
    assert.equal(isPatternId(123), false);
    assert.equal(isPatternId(null), false);
  });

  it("cycles nextPattern and prevPattern without dropping elements", () => {
    for (let i = 0; i < PATTERN_IDS.length; i++) {
      const current = PATTERN_IDS[i]!;
      const next = nextPattern(current);
      const prev = prevPattern(next);
      assert.equal(prev, current);
    }
  });

  it("matches all patterns in PATTERN_MAP", () => {
    assert.equal(PATTERNS.length, 6);
    for (const pattern of PATTERNS) {
      assert.equal(PATTERN_MAP[pattern.id], pattern);
      assert.ok(pattern.num);
      assert.ok(pattern.name);
      assert.ok(pattern.relation);
      assert.ok(pattern.css);
      assert.ok(pattern.prompt);
    }
  });

  it("grades quiz answers accurately", () => {
    for (const item of QUIZ) {
      const correctRes = gradeQuizAnswer(item.id, item.answer);
      assert.ok(correctRes);
      assert.equal(correctRes.correct, true);
      assert.equal(correctRes.expected, item.answer);

      // Wrong answer test
      const wrongChoice = item.answer === "whitespace" ? "form" : "whitespace";
      const wrongRes = gradeQuizAnswer(item.id, wrongChoice);
      assert.ok(wrongRes);
      assert.equal(wrongRes.correct, false);
      assert.equal(wrongRes.expected, item.answer);
    }

    assert.equal(gradeQuizAnswer("non-existent-quiz", "whitespace"), null);
  });
});
