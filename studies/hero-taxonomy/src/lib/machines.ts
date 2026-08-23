export type KindId =
  | "product"
  | "portfolio"
  | "event"
  | "commerce"
  | "media"
  | "education"
  | "tool"
  | "community";

export type JobQuestion =
  | "能解决什么？"
  | "你是谁、做得怎样？"
  | "为什么现在参加？"
  | "卖什么、值不值得？"
  | "发生了什么？"
  | "能学到什么？"
  | "能帮我做什么？"
  | "谁在这里？";

export const KIND_IDS: readonly KindId[] = [
  "product",
  "portfolio",
  "event",
  "commerce",
  "media",
  "education",
  "tool",
  "community",
];

const QUESTION: Record<KindId, JobQuestion> = {
  product: "能解决什么？",
  portfolio: "你是谁、做得怎样？",
  event: "为什么现在参加？",
  commerce: "卖什么、值不值得？",
  media: "发生了什么？",
  education: "能学到什么？",
  tool: "能帮我做什么？",
  community: "谁在这里？",
};

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

/** The first-fold job. Not “make a fancy hero”. */
export function questionOf(kind: KindId): JobQuestion {
  return QUESTION[kind];
}

/** One primary per fold. A secondary may exist; a second filled primary may not. */
export function primaryCtaCount(_kind: KindId): 1 {
  return 1;
}

/**
 * A shop home must not rotate posters.
 * A portfolio magazine banner may rotate representative work.
 */
export function allowsCarousel(kind: KindId): boolean {
  return kind === "portfolio";
}

/** Five (or even two) posters on a shop home is the anti-pattern. */
export function tooManyBanners(kind: KindId, count: number): boolean {
  if (kind !== "commerce") return false;
  if (!Number.isFinite(count)) return false;
  return count > 1;
}
