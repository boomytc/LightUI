import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GOOD_INTERVALS,
  KIND_IDS,
  advanceDueQueue,
  applyGrade,
  canGrade,
  dueCards,
  intervalDays,
  isFace,
  isGrade,
  isKindId,
  nextIndexAfterGrade,
  shiftISO,
  stageState,
  todayISO,
  type Card,
} from "./machines";

const TODAY = "2026-08-23";

function card(patch: Partial<Card> = {}): Card {
  return {
    id: "a",
    question: "Q",
    mine: "mine",
    answer: "answer",
    reviewCount: 0,
    nextReview: TODAY,
    ...patch,
  };
}

describe("KIND_IDS", () => {
  it("is a single deck", () => {
    assert.deepEqual(KIND_IDS, ["deck"]);
    assert.equal(isKindId("deck"), true);
    assert.equal(isKindId("carousel"), false);
  });
});

describe("stageState", () => {
  it("defaults to answer so the three grades are visible", () => {
    assert.equal(stageState(""), "answer");
    assert.equal(stageState("open"), "answer");
    assert.equal(stageState("question"), "question");
    assert.equal(stageState("answer"), "answer");
    assert.equal(stageState("empty"), "empty");
  });
});

describe("canGrade", () => {
  it("is false on the question face and true only after the flip", () => {
    assert.equal(canGrade("question"), false);
    assert.equal(canGrade("answer"), true);
    assert.equal(isFace("question"), true);
    assert.equal(isFace("empty"), false);
  });
});

describe("dueCards", () => {
  it("keeps cards due today or overdue, in source order", () => {
    const cards = [
      card({ id: "future", nextReview: shiftISO(TODAY, 3) }),
      card({ id: "today", nextReview: TODAY }),
      card({ id: "overdue", nextReview: shiftISO(TODAY, -1) }),
    ];
    assert.deepEqual(
      dueCards(cards, TODAY).map((c) => c.id),
      ["today", "overdue"],
    );
  });

  it("is empty when nothing is due", () => {
    const cards = [card({ id: "later", nextReview: shiftISO(TODAY, 1) })];
    assert.deepEqual(dueCards(cards, TODAY), []);
    assert.deepEqual(dueCards([], TODAY), []);
  });
});

describe("intervalDays", () => {
  it("maps the count after a good grade onto 1, 3, 7, 14, 30 and caps", () => {
    assert.deepEqual(GOOD_INTERVALS, [1, 3, 7, 14, 30]);
    assert.equal(intervalDays(1), 1);
    assert.equal(intervalDays(2), 3);
    assert.equal(intervalDays(3), 7);
    assert.equal(intervalDays(4), 14);
    assert.equal(intervalDays(5), 30);
    assert.equal(intervalDays(6), 30);
    assert.equal(intervalDays(9), 30);
  });
});

describe("applyGrade", () => {
  it("again resets the count and stays due today — not tomorrow like hard", () => {
    const before = card({ id: "x", reviewCount: 2, nextReview: TODAY });
    const next = applyGrade(before, "again", TODAY);
    assert.equal(next.reviewCount, 0);
    assert.equal(next.nextReview, TODAY);
    assert.equal(dueCards([next], TODAY).length, 1);
    assert.notEqual(next.nextReview, shiftISO(TODAY, 1));
    assert.notEqual(next, before);
    assert.equal(before.reviewCount, 2);
  });

  it("hard keeps the count and schedules tomorrow", () => {
    const before = card({ reviewCount: 2, nextReview: TODAY });
    const next = applyGrade(before, "hard", TODAY);
    assert.equal(next.reviewCount, 2);
    assert.equal(next.nextReview, shiftISO(TODAY, 1));
    assert.equal(dueCards([next], TODAY).length, 0);
  });

  it("good 0→1 day, 1→3 days, 2→7, then 14, 30, capped", () => {
    const from0 = applyGrade(card({ reviewCount: 0 }), "good", TODAY);
    assert.equal(from0.reviewCount, 1);
    assert.equal(from0.nextReview, shiftISO(TODAY, 1));

    const from1 = applyGrade(card({ reviewCount: 1 }), "good", TODAY);
    assert.equal(from1.reviewCount, 2);
    assert.equal(from1.nextReview, shiftISO(TODAY, 3));

    const from2 = applyGrade(card({ reviewCount: 2 }), "good", TODAY);
    assert.equal(from2.reviewCount, 3);
    assert.equal(from2.nextReview, shiftISO(TODAY, 7));

    const from3 = applyGrade(card({ reviewCount: 3 }), "good", TODAY);
    assert.equal(from3.reviewCount, 4);
    assert.equal(from3.nextReview, shiftISO(TODAY, 14));

    const from4 = applyGrade(card({ reviewCount: 4 }), "good", TODAY);
    assert.equal(from4.reviewCount, 5);
    assert.equal(from4.nextReview, shiftISO(TODAY, 30));

    const from8 = applyGrade(card({ reviewCount: 8 }), "good", TODAY);
    assert.equal(from8.reviewCount, 9);
    assert.equal(from8.nextReview, shiftISO(TODAY, 30));
  });

  it("again and hard are not the same machine", () => {
    const again = applyGrade(card({ reviewCount: 3 }), "again", TODAY);
    const hard = applyGrade(card({ reviewCount: 3 }), "hard", TODAY);
    assert.equal(isGrade("again"), true);
    assert.notEqual(again.nextReview, hard.nextReview);
    assert.equal(again.reviewCount, 0);
    assert.equal(hard.reviewCount, 3);
  });
});

describe("nextIndexAfterGrade", () => {
  it("again rotates the current card to the end; the next front is index 0", () => {
    const queue = [card({ id: "a" }), card({ id: "b" }), card({ id: "c" })];
    const next = advanceDueQueue(queue, "again");
    assert.deepEqual(
      next.map((c) => c.id),
      ["b", "c", "a"],
    );
    assert.equal(nextIndexAfterGrade(queue, "again"), 0);
    assert.equal(next[nextIndexAfterGrade(queue, "again")]?.id, "b");
  });

  it("again on a single card stays due at the front", () => {
    const queue = [card({ id: "only" })];
    const next = advanceDueQueue(queue, "again");
    assert.deepEqual(
      next.map((c) => c.id),
      ["only"],
    );
    assert.equal(nextIndexAfterGrade(queue, "again"), 0);
  });

  it("hard and good remove from the front; next index is still 0", () => {
    const queue = [card({ id: "a" }), card({ id: "b" }), card({ id: "c" })];
    assert.deepEqual(
      advanceDueQueue(queue, "hard").map((c) => c.id),
      ["b", "c"],
    );
    assert.deepEqual(
      advanceDueQueue(queue, "good").map((c) => c.id),
      ["b", "c"],
    );
    assert.equal(nextIndexAfterGrade(queue, "hard"), 0);
    assert.equal(nextIndexAfterGrade(queue, "good"), 0);
  });

  it("hard or good on the last card empties the pile", () => {
    const queue = [card({ id: "last" })];
    assert.deepEqual(advanceDueQueue(queue, "good"), []);
    assert.deepEqual(advanceDueQueue(queue, "hard"), []);
    assert.equal(nextIndexAfterGrade(queue, "good"), 0);
  });
});

describe("todayISO / shiftISO", () => {
  it("keeps calendar days in ISO form", () => {
    assert.equal(todayISO(new Date(2026, 7, 23)), "2026-08-23");
    assert.equal(shiftISO("2026-08-23", 1), "2026-08-24");
    assert.equal(shiftISO("2026-08-31", 1), "2026-09-01");
    assert.equal(shiftISO("2026-08-23", 0), "2026-08-23");
  });
});
