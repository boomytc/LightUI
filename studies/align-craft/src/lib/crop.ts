export type Box = { x: number; y: number; w: number; h: number };

/** Fixture subject, normalized to the source frame. */
export const WALK_SUBJECT: Box = { x: 0.425, y: 0.7875, w: 0.15, h: 0.14 };

export const WALK_ASPECT = 240 / 400;

export type CoverWindow = {
  top: number;
  left: number;
  width: number;
  height: number;
  objectX: number;
  objectY: number;
};

function contain(start: number, end: number, visible: number) {
  const max = Math.max(0, 1 - visible);
  const mid = (start + end) / 2;
  let origin = mid - visible / 2;
  if (end - start <= visible) {
    if (origin > start) origin = start;
    if (origin + visible < end) origin = end - visible;
  } else {
    origin = start;
  }
  return Math.min(max, Math.max(0, origin));
}

/**
 * Cover-crop `sourceAspect` (w/h) into `targetAspect`.
 * The window is shifted so `subject` stays inside, instead of a center cut.
 */
export function subjectCover(
  subject: Box,
  sourceAspect: number,
  targetAspect: number,
): CoverWindow {
  if (sourceAspect <= targetAspect) {
    const height = Math.min(1, sourceAspect / targetAspect);
    const top = contain(subject.y, subject.y + subject.h, height);
    const span = 1 - height;
    const objectY = span === 0 ? 50 : (top / span) * 100;
    return { top, left: 0, width: 1, height, objectX: 50, objectY };
  }
  const width = Math.min(1, targetAspect / sourceAspect);
  const left = contain(subject.x, subject.x + subject.w, width);
  const span = 1 - width;
  const objectX = span === 0 ? 50 : (left / span) * 100;
  return { top: 0, left, width, height: 1, objectX, objectY: 50 };
}

export function centerCover(sourceAspect: number, targetAspect: number): CoverWindow {
  if (sourceAspect <= targetAspect) {
    const height = Math.min(1, sourceAspect / targetAspect);
    const top = (1 - height) / 2;
    return { top, left: 0, width: 1, height, objectX: 50, objectY: 50 };
  }
  const width = Math.min(1, targetAspect / sourceAspect);
  const left = (1 - width) / 2;
  return { top: 0, left, width, height: 1, objectX: 50, objectY: 50 };
}
