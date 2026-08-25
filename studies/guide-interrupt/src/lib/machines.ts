export type KindId = "tour" | "coach" | "hotspot" | "spotlight" | "checklist" | "hint";

export const KIND_IDS: readonly KindId[] = [
  "tour",
  "coach",
  "hotspot",
  "spotlight",
  "checklist",
  "hint",
];

export function isKindId(v: string): v is KindId {
  return (KIND_IDS as readonly string[]).includes(v);
}

export type Advance =
  | "next"
  | "confirm"
  | "open-read"
  | "click-target"
  | "task-complete"
  | "state-clear";

export const TOUR_COUNT = 3;

const RULE: Record<
  KindId,
  { advance: Advance; blocks: boolean; persists: boolean; skip: boolean; pad: number }
> = {
  tour: { advance: "next", blocks: true, persists: false, skip: true, pad: 6 },
  coach: { advance: "confirm", blocks: false, persists: false, skip: false, pad: 0 },
  hotspot: { advance: "open-read", blocks: false, persists: false, skip: false, pad: 0 },
  spotlight: { advance: "click-target", blocks: true, persists: false, skip: false, pad: 10 },
  checklist: { advance: "task-complete", blocks: false, persists: true, skip: false, pad: 0 },
  hint: { advance: "state-clear", blocks: false, persists: false, skip: false, pad: 0 },
};

export function guideAdvance(kind: KindId): Advance {
  return RULE[kind].advance;
}

export function guideBlocksOutside(kind: KindId): boolean {
  return RULE[kind].blocks;
}

export function guidePersists(kind: KindId): boolean {
  return RULE[kind].persists;
}

export function allowsSkip(kind: KindId): boolean {
  return RULE[kind].skip;
}

export type Hotspot = "unread" | "open" | "read";

export function hotspotNext(state: Hotspot, event: "click-dot" | "dismiss"): Hotspot {
  if (state === "unread" && event === "click-dot") return "open";
  if (state === "open" && event === "dismiss") return "read";
  return state;
}

export type HintFields = { title: string; permission: boolean };

export function hintActive(fields: HintFields): "title" | "permission" | null {
  if (fields.title.trim() === "") return "title";
  if (!fields.permission) return "permission";
  return null;
}

export function tourStep(
  step: number,
  count: number,
  event: "next" | "skip" | "back",
): { step: number; done: boolean } {
  const n = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  let s = Number.isFinite(step) ? Math.floor(step) : 0;
  if (s < 0) s = 0;
  if (n === 0) return { step: 0, done: true };
  const done = s >= n;
  if (event === "skip") return { step: n, done: true };
  if (event === "next") {
    if (done) return { step: n, done: true };
    const next = s + 1;
    if (next >= n) return { step: n, done: true };
    return { step: next, done: false };
  }
  if (done) return { step: n - 1, done: false };
  return { step: Math.max(0, s - 1), done: false };
}

export function checklistProgress(done: readonly string[], total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const n = done.length;
  if (n <= 0) return 0;
  if (n >= total) return 1;
  return n / total;
}

export type Cutout = { x: number; y: number; w: number; h: number };

export function cutoutPad(kind: KindId, rect: Cutout): Cutout {
  const pad = RULE[kind].pad;
  return {
    x: rect.x - pad,
    y: rect.y - pad,
    w: rect.w + pad * 2,
    h: rect.h + pad * 2,
  };
}

export function stageLock(kind: KindId, raw: string): string {
  if (kind === "tour") {
    if (raw === "step2" || raw === "done") return raw;
    return "step1";
  }
  if (kind === "hotspot") {
    if (raw === "open" || raw === "read") return raw;
    return "unread";
  }
  if (raw === "mid" || raw === "done") return raw;
  return "start";
}
