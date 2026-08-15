export type CascadeNode = {
  id: string;
  children?: CascadeNode[];
};

export function nodeAt<T extends CascadeNode>(
  tree: readonly T[],
  path: readonly string[],
): T | undefined {
  let nodes: readonly T[] | undefined = tree;
  let found: T | undefined;
  for (const id of path) {
    found = nodes?.find((n) => n.id === id);
    if (!found) return undefined;
    nodes = found.children as T[] | undefined;
  }
  return found;
}

export function columnsOf<T extends CascadeNode>(tree: readonly T[], draft: readonly string[]): T[][] {
  const cols: T[][] = [tree as T[]];
  for (let i = 0; i < draft.length; i++) {
    const node = nodeAt(tree, draft.slice(0, i + 1));
    if (!node?.children?.length) break;
    cols.push(node.children as T[]);
  }
  return cols;
}

export type CascadePick = {
  draft: string[];
  committed: string[] | null;
  close: boolean;
};

export function pickCascade(
  tree: readonly CascadeNode[],
  draft: readonly string[],
  level: number,
  id: string,
): CascadePick {
  const next = [...draft.slice(0, level), id];
  const node = nodeAt(tree, next);
  if (node?.children?.length) {
    return { draft: next, committed: null, close: false };
  }
  return { draft: next, committed: next, close: true };
}

export function reopenDraft(committed: readonly string[] | null): string[] {
  return committed ? [...committed] : [];
}
