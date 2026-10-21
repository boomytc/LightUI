import assert from "node:assert/strict";
import { test } from "node:test";
import { subjectCover, centerCover, WALK_SUBJECT, WALK_ASPECT } from "./crop";
test("keeps the low subject when a center crop loses its feet", () => {
  const crop = subjectCover(WALK_SUBJECT, WALK_ASPECT, 1);
  const center = centerCover(WALK_ASPECT, 1);
  assert.ok(center.top + center.height < WALK_SUBJECT.y + WALK_SUBJECT.h);
  assert.ok(crop.top <= WALK_SUBJECT.y);
  assert.ok(crop.top + crop.height >= WALK_SUBJECT.y + WALK_SUBJECT.h);
});
test("clamps source edges and preserves fitting subjects on both axes", () => {
  for (const source of [0.6, 1, 16 / 9])
    for (const target of [0.5, 1, 16 / 9]) {
      for (const pos of [0, 0.5, 0.9]) {
        const subject = { x: pos, y: pos, w: 0.1, h: 0.1 };
        const crop = subjectCover(subject, source, target);
        assert.ok(crop.left >= 0 && crop.top >= 0);
        assert.ok(
          crop.left + crop.width <= 1.000001 &&
            crop.top + crop.height <= 1.000001,
        );
        assert.ok(crop.left <= pos && crop.top <= pos);
        assert.ok(
          crop.left + crop.width >= pos + 0.1 - 1e-8 &&
            crop.top + crop.height >= pos + 0.1 - 1e-8,
        );
        assert.ok(
          crop.objectX >= 0 &&
            crop.objectX <= 100 &&
            crop.objectY >= 0 &&
            crop.objectY <= 100,
        );
      }
    }
});
test("no crop has neutral positioning; oversized subjects stay bounded", () => {
  assert.deepEqual(subjectCover({ x: 0, y: 0, w: 1, h: 1 }, 1, 1), {
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    objectX: 50,
    objectY: 50,
  });
  const crop = subjectCover({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, 0.5, 2);
  assert.ok(crop.top >= 0 && crop.top + crop.height <= 1);
});
