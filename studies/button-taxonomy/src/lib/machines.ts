export type KindId = "solid" | "outline" | "text";

export type Weight = "primary" | "secondary" | "tertiary";

/** Job in the region: the one commit, the pair that must not compete, or a quiet out. */
export type Role = "commit" | "pair" | "quiet";

export const KIND_IDS: readonly KindId[] = ["solid", "outline", "text"];

export function weight(kind: KindId): Weight {
  switch (kind) {
    case "solid":
      return "primary";
    case "outline":
      return "secondary";
    case "text":
      return "tertiary";
  }
}

/** Only the solid leaf is filled. Outline and text must not compete with fill. */
export function filled(kind: KindId): boolean {
  return kind === "solid";
}

/** A region may have only one primary. True when the filled count is greater than 1. */
export function tooManyPrimaries(count: number): boolean {
  return count > 1;
}

export function roleFor(kind: KindId): Role {
  switch (kind) {
    case "solid":
      return "commit";
    case "outline":
      return "pair";
    case "text":
      return "quiet";
  }
}

export function primaryCount(kinds: readonly KindId[]): number {
  return kinds.filter((kind) => weight(kind) === "primary").length;
}
