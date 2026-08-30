export const DEFAULT_BACK_TO_TOP_THRESHOLD = 240;

/**
 * Calculates reading progress ratio [0, 1] based on container scroll geometry.
 */
export function calculateProgressRatio(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const max = scrollHeight - clientHeight;
  if (max <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / max));
}

/**
 * Determines whether the back-to-top button should be visible.
 */
export function shouldShowBackToTop(
  scrollTop: number,
  thresholdPx: number = DEFAULT_BACK_TO_TOP_THRESHOLD,
): boolean {
  return scrollTop > thresholdPx;
}

/**
 * Verifies whether navigating to targetStep is allowed in a stepper.
 * Users may review any step up to currentStep or previously completed, but cannot skip forward.
 */
export function canNavigateStep(
  targetStep: number,
  currentStep: number,
  totalSteps: number,
): boolean {
  if (targetStep < 0 || targetStep >= totalSteps) return false;
  return targetStep <= currentStep;
}

export type SearchableEntry = {
  id: string;
  title: string;
  tags: string[];
  excerpt: string;
};

/**
 * Generates character n-grams for fuzzy CJK and token matching.
 */
export function extractSearchTokens(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out = new Set<string>();
  out.add(q);
  for (const part of q.split(/[\s,，、]+/)) {
    if (part) out.add(part);
  }
  const compact = q.replace(/[\s,，、]+/g, "");
  for (let i = 0; i < compact.length - 1; i++) {
    out.add(compact.slice(i, i + 2));
    if (i + 3 <= compact.length) out.add(compact.slice(i, i + 3));
  }
  return [...out].sort((a, b) => b.length - a.length);
}

/**
 * Computes a relevance score for an entry given a query.
 * Title hits weigh most, then tags, then excerpt.
 */
export function computeSearchScore(query: string, entry: SearchableEntry): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const hay = `${entry.title} ${entry.tags.join(" ")} ${entry.excerpt}`.toLowerCase();
  if (hay.includes(q)) return 8;

  const tokens = extractSearchTokens(q);
  let score = 0;
  let hits = 0;
  for (const token of tokens) {
    if (!hay.includes(token)) continue;
    hits += 1;
    if (entry.title.toLowerCase().includes(token)) score += token.length >= 3 ? 3 : 2;
    else if (entry.tags.some((t) => t.toLowerCase().includes(token))) score += 2;
    else score += 1;
  }
  if (tokens.length >= 2 && hits / tokens.length < 0.35) return 0;
  return score < 2 ? 0 : score;
}

/**
 * Counts item occurrences by status for faceted filters.
 */
export function countByStatus<T extends { status: string }>(items: T[]): Record<string, number> {
  const counts: Record<string, number> = { all: items.length };
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}
