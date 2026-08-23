export type KindId = "deck";

export type Face = "question" | "answer";

export type StageState = "question" | "answer" | "empty";

export type Grade = "again" | "hard" | "good";

export type Card = {
  id: string;
  question: string;
  mine: string;
  answer: string;
  reviewCount: number;
  nextReview: string;
};

export const KIND_IDS: readonly KindId[] = ["deck"];

export const GOOD_INTERVALS = [1, 3, 7, 14, 30] as const;

export function isKindId(value: string): value is KindId {
  return value === "deck";
}

export function isGrade(value: string): value is Grade {
  return value === "again" || value === "hard" || value === "good";
}

export function isFace(value: string): value is Face {
  return value === "question" || value === "answer";
}

export function stageState(raw: string): StageState {
  if (raw === "question" || raw === "answer" || raw === "empty") return raw;
  return "answer";
}

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  return todayISO(dt);
}

export function dueCards(cards: readonly Card[], today: string): Card[] {
  return cards.filter((card) => card.nextReview <= today);
}

export function canGrade(face: Face): boolean {
  return face === "answer";
}

/** Days until next review after a good grade, keyed by the new `reviewCount`. */
export function intervalDays(reviewCount: number): number {
  const index = Math.min(Math.max(reviewCount, 1) - 1, GOOD_INTERVALS.length - 1);
  return GOOD_INTERVALS[index]!;
}

export function applyGrade(card: Card, grade: Grade, today: string): Card {
  if (grade === "again") {
    return { ...card, reviewCount: 0, nextReview: today };
  }
  if (grade === "hard") {
    return { ...card, nextReview: shiftISO(today, 1) };
  }
  const nextCount = card.reviewCount + 1;
  return {
    ...card,
    reviewCount: nextCount,
    nextReview: shiftISO(today, intervalDays(nextCount)),
  };
}

/**
 * Due pile is a deque; the current card is always index 0.
 * `again` rotates it to the end so it stays due today.
 * `hard` / `good` drop it from the front.
 * The next card to show is the new front (0), or 0 on an empty pile.
 */
export function advanceDueQueue<T>(queue: readonly T[], grade: Grade): T[] {
  if (queue.length === 0) return [];
  const current = queue[0]!;
  const rest = queue.slice(1);
  if (grade === "again") return [...rest, current];
  return rest;
}

export function nextIndexAfterGrade(queue: readonly unknown[], grade: Grade): number {
  void advanceDueQueue(queue, grade);
  return 0;
}
