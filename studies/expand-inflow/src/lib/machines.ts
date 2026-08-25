export type KindId = "accordion" | "collapse" | "tree" | "row" | "readmore" | "card";

export const KIND_IDS: readonly KindId[] = [
  "accordion",
  "collapse",
  "tree",
  "row",
  "readmore",
  "card",
];

export const COLLAPSED_LINES = 3;

export function isKindId(v: string): v is KindId {
  return (KIND_IDS as readonly string[]).includes(v);
}

/** Every leaf in this study pushes document flow. Covering is an overlay. */
export function coversPage(kind: KindId): boolean {
  void kind;
  return false;
}

export function exclusiveOpen(kind: KindId): boolean {
  return kind === "accordion";
}

/** Detail follows the row and later rows must move down. */
export function rowInFlow(kind: KindId): boolean {
  return kind === "row";
}

export function toggleAccordion(openId: string | null, id: string): string | null {
  return openId === id ? null : id;
}

export function toggleSet(open: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(open);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function treeToggleExpand(expanded: ReadonlySet<string>, id: string): Set<string> {
  return toggleSet(expanded, id);
}

export function treeSelect(currentId: string | null, id: string): string {
  void currentId;
  return id;
}

export function readMoreHeight(open: boolean, collapsedPx: number, scrollHeight: number): number {
  const collapsed = Math.max(0, collapsedPx);
  const full = Math.max(0, scrollHeight);
  return open ? full : collapsed;
}

export function collapsedPx(lineHeight: number, lines?: number): number {
  return lineHeight * (lines ?? COLLAPSED_LINES);
}
