export type SpyEntry = {
  id: string;
  intersecting: boolean;
  ratio: number;
};

export function pickActive(entries: readonly SpyEntry[], locked: boolean, current: string): string {
  if (locked) return current;
  const visible = entries
    .filter((entry) => entry.intersecting)
    .sort((a, b) => b.ratio - a.ratio);
  return visible[0]?.id ?? current;
}

export function beginJump(id: string): { active: string; locked: true } {
  return { active: id, locked: true };
}
