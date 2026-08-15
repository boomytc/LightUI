export function toggleMulti(selected: readonly string[], id: string, max: number): string[] {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  if (selected.length >= max) return [...selected];
  return [...selected, id];
}

export function removeMulti(selected: readonly string[], id: string): string[] {
  return selected.filter((item) => item !== id);
}

export function clearMulti(): string[] {
  return [];
}

export function isBlocked(selected: readonly string[], id: string, max: number): boolean {
  return !selected.includes(id) && selected.length >= max;
}
