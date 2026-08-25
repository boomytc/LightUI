export type KindId = "reorder" | "dropzone" | "transfer" | "snapback";

export const KIND_IDS: readonly KindId[] = ["reorder", "dropzone", "transfer", "snapback"];

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export const DRAG_THRESHOLD_PX = 6;
export const EDGE_ZONE_PX = 64;

export type CommitKind = "reorder" | "receive" | "transfer" | "reject";

export function commitKind(kind: KindId): CommitKind {
  switch (kind) {
    case "reorder":
      return "reorder";
    case "dropzone":
      return "receive";
    case "transfer":
      return "transfer";
    case "snapback":
      return "reject";
  }
}

export type SlotBox = { id: string; top: number; height: number };

/** Insertion index among remaining items (0..n). The dragging slot is excluded. */
export function insertIndexY(slots: SlotBox[], y: number, draggingId: string): number {
  const remaining = slots.filter((slot) => slot.id !== draggingId);
  for (let i = 0; i < remaining.length; i++) {
    const slot = remaining[i]!;
    if (y < slot.top + slot.height / 2) return i;
  }
  return remaining.length;
}

export type Rect = { left: number; top: number; right: number; bottom: number };

export function dropzoneHit(box: Rect, x: number, y: number): boolean {
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

export type Item = { id: string };

export function moveItem<T extends Item>(list: T[], fromId: string, toIndex: number): T[] {
  const from = list.findIndex((item) => item.id === fromId);
  if (from < 0) return list.slice();
  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (!item) return list.slice();
  const clamped = Math.max(0, Math.min(toIndex, next.length));
  next.splice(clamped, 0, item);
  return next;
}

export function transferItem<T extends Item>(
  source: T[],
  dest: T[],
  id: string,
  destIndex: number,
): { source: T[]; dest: T[] } {
  const from = source.findIndex((item) => item.id === id);
  if (from < 0) return { source: source.slice(), dest: dest.slice() };
  const nextSource = source.slice();
  const [item] = nextSource.splice(from, 1);
  if (!item) return { source: source.slice(), dest: dest.slice() };
  const nextDest = dest.slice();
  const clamped = Math.max(0, Math.min(destIndex, nextDest.length));
  nextDest.splice(clamped, 0, item);
  return { source: nextSource, dest: nextDest };
}

export function snapbackKeepsModel(validDrop: boolean): boolean {
  return !validDrop;
}

export function passedThreshold(dx: number, dy: number, threshold: number = DRAG_THRESHOLD_PX): boolean {
  return Math.hypot(dx, dy) >= threshold;
}

export function edgeScrollDelta(
  pointerY: number,
  containerTop: number,
  containerBottom: number,
  maxSpeed = 16,
): number {
  if (pointerY < containerTop || pointerY > containerBottom) return 0;
  const height = containerBottom - containerTop;
  if (height <= 0) return 0;
  const zone = Math.min(EDGE_ZONE_PX, height / 2);
  if (zone <= 0) return 0;
  if (pointerY < containerTop + zone) {
    return -maxSpeed * ((containerTop + zone - pointerY) / zone);
  }
  if (pointerY > containerBottom - zone) {
    return maxSpeed * ((pointerY - (containerBottom - zone)) / zone);
  }
  return 0;
}
