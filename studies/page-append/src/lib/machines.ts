export type KindId = "page" | "append";

export const KIND_IDS: readonly KindId[] = ["page", "append"];

export function isKindId(v: string): v is KindId {
  return (KIND_IDS as readonly string[]).includes(v);
}

export type CollectionMode = "replace" | "append";

export type StageState = "page1" | "page2" | "partial" | "exhausted";

export const STAGE_STATES: readonly StageState[] = ["page1", "page2", "partial", "exhausted"];

export function isStageState(v: string): v is StageState {
  return (STAGE_STATES as readonly string[]).includes(v);
}

export function collectionMode(kind: KindId): CollectionMode {
  return kind === "page" ? "replace" : "append";
}

export function dropsOldItems(kind: KindId): boolean {
  return collectionMode(kind) === "replace";
}

export function resetsScroll(kind: KindId): boolean {
  return collectionMode(kind) === "replace";
}

export function pageSlice<T>(items: readonly T[], page: number, pageSize: number): T[] {
  if (page < 1 || pageSize <= 0) return [];
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0 || total <= 0) return 0;
  return Math.ceil(total / pageSize);
}

export function nextPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page + 1, 1), totalPages);
}

export function prevPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page - 1, 1), totalPages);
}

export function appendCount(visible: number, batch: number, total: number): number {
  const cap = Math.max(0, total);
  const clamped = Math.min(Math.max(0, visible), cap);
  return Math.min(clamped + batch, cap);
}

export function appendExhausted(visible: number, total: number): boolean {
  return visible >= total && total >= 0;
}

export type CollectionView<T> = {
  shown: T[];
  page: number;
  visible: number;
  exhausted: boolean;
  scrollReset: boolean;
};

export function collectionView<T>(
  kind: KindId,
  items: readonly T[],
  opts: { page: number; pageSize: number; visible: number; batch: number },
): CollectionView<T> {
  const total = items.length;
  if (kind === "page") {
    void opts.visible;
    void opts.batch;
    const shown = pageSlice(items, opts.page, opts.pageSize);
    return {
      shown,
      page: opts.page,
      visible: shown.length,
      exhausted: opts.page >= pageCount(total, opts.pageSize),
      scrollReset: true,
    };
  }

  void opts.page;
  void opts.pageSize;
  const visible = appendCount(opts.visible, 0, total);
  return {
    shown: items.slice(0, visible),
    page: 1,
    visible,
    exhausted: appendExhausted(opts.visible, total),
    scrollReset: false,
  };
}

export function stageState(raw: string, kind: KindId = "page"): StageState {
  if (isStageState(raw)) return raw;
  return kind === "append" ? "partial" : "page1";
}

/** Locked playground numbers for a stage still. */
export function stageLock(
  kind: KindId,
  state: StageState,
  total: number,
  pageSize: number,
  batch: number,
): { page: number; visible: number } {
  if (kind === "page") {
    const pages = pageCount(total, pageSize);
    if (state === "page2") return { page: Math.min(2, Math.max(1, pages)), visible: 0 };
    if (state === "exhausted") return { page: Math.max(1, pages), visible: 0 };
    return { page: 1, visible: 0 };
  }
  if (state === "exhausted") return { page: 1, visible: Math.max(0, total) };
  if (state === "page1") return { page: 1, visible: Math.min(pageSize, Math.max(0, total)) };
  return { page: 1, visible: Math.min(pageSize + batch, Math.max(0, total)) };
}
