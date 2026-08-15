export function crumbDepth(length: number, depth: number): number {
  if (length <= 0) return 0;
  return Math.min(length, Math.max(1, depth));
}

export function crumbTrail<T>(items: readonly T[], depth: number): T[] {
  return items.slice(0, crumbDepth(items.length, depth));
}

export function isCurrent(index: number, depth: number): boolean {
  return index === depth - 1;
}

export function shortenTo(index: number): number {
  return index + 1;
}
