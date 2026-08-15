export function toggleBranch(open: string[], id: string): string[] {
  return open.includes(id) ? open.filter((item) => item !== id) : [...open, id];
}

export function defaultChild<T extends { id: string; children?: { id: string }[] }>(
  branch: T,
): string {
  return branch.children?.[0]?.id ?? branch.id;
}
