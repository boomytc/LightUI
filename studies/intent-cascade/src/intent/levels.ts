import type { MenuNode } from "../lib/menu-data";
import { pick, type Locale } from "../lib/site-locale";
import type { LevelSlice } from "./types";

export function childrenOf(tree: MenuNode[], path: string[]): MenuNode[] | null {
  let nodes = tree;
  for (const id of path) {
    const node = nodes.find((n) => n.id === id);
    if (!node?.children?.length) return null;
    nodes = node.children;
  }
  return nodes;
}

export function levelsFrom(tree: MenuNode[], path: string[], locale: Locale): LevelSlice[] {
  const slices: LevelSlice[] = [
    {
      level: 0,
      nodes: tree,
      activeId: path[0] ?? null,
      placeholder: locale === "en" ? "Search all..." : "搜索全部...",
    },
  ];
  let walk = tree;
  for (let i = 0; i < path.length; i++) {
    const node = walk.find((n) => n.id === path[i]);
    if (!node?.children?.length) break;
    slices.push({
      level: i + 1,
      nodes: node.children,
      activeId: path[i + 1] ?? null,
      placeholder: node.searchPlaceholder
        ? pick(node.searchPlaceholder, locale)
        : locale === "en"
          ? `Search ${pick(node.label, locale)}...`
          : `搜索${pick(node.label, locale)}...`,
    });
    walk = node.children;
  }
  return slices;
}
