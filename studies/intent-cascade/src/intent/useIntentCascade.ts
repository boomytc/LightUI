import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dist,
  pointInRect,
  pointInTriangle,
  predictsIntent,
  type Point,
} from "../lib/geometry";
import type { MenuNode } from "../lib/menu-data";
import { pick, type Locale } from "../lib/site-locale";
import type { AimBand, AimDecision, CascadeState, LevelSlice, PointerKind } from "./types";

export type IntentOptions = {
  enabled: boolean;
  restDelay: number;
  tree: MenuNode[];
  initialPath?: string[];
  locale?: Locale;
};

type ItemHit = { level: number; id: string };

const HISTORY = 5;
const CLOSE_GRACE = 200;
const PANEL_PAD = 2;
const TRI_PAD = 6;

function childrenOf(tree: MenuNode[], path: string[]): MenuNode[] | null {
  let nodes = tree;
  for (const id of path) {
    const node = nodes.find((n) => n.id === id);
    if (!node?.children?.length) return null;
    nodes = node.children;
  }
  return nodes;
}

function levelsFrom(tree: MenuNode[], path: string[], locale: Locale): LevelSlice[] {
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

function readRect(el: Element | null | undefined) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

function inGapBridge(
  p: Point,
  parentRect: { left: number; top: number; right: number; bottom: number },
  childRect: { left: number; top: number; right: number; bottom: number },
): boolean {
  const left = Math.min(parentRect.right, childRect.left);
  const right = Math.max(parentRect.right, childRect.left);
  const top = Math.min(parentRect.top, childRect.top) - 4;
  const bottom = Math.max(parentRect.bottom, childRect.bottom) + 4;
  return p.x >= left - 2 && p.x <= right + 2 && p.y >= top && p.y <= bottom;
}

export function useIntentCascade({ enabled, restDelay, tree, initialPath = [], locale = "zh" }: IntentOptions) {
  const [open, setOpen] = useState(true);
  const [path, setPath] = useState<string[]>(initialPath);
  const [mouse, setMouse] = useState<Point | null>(null);
  const [bands, setBands] = useState<AimBand[]>([]);
  const [decision, setDecision] = useState<AimDecision>("idle");
  const [hoveredId, setHoveredId] = useState<string | null>(initialPath[initialPath.length - 1] ?? null);
  const [pointerKind, setPointerKind] = useState<PointerKind>("unknown");
  const [coarse, setCoarse] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Map<number, HTMLElement>>(new Map());
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const history = useRef<Point[]>([]);
  const restTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const pathRef = useRef(path);
  const openRef = useRef(open);
  const enabledRef = useRef(enabled);
  const restDelayRef = useRef(restDelay);
  const treeRef = useRef(tree);
  const initialPathRef = useRef(initialPath);
  const localeRef = useRef(locale);

  pathRef.current = path;
  openRef.current = open;
  enabledRef.current = enabled;
  restDelayRef.current = restDelay;
  treeRef.current = tree;
  initialPathRef.current = initialPath;
  localeRef.current = locale;

  const levels = useMemo(() => levelsFrom(tree, path, locale), [tree, path, locale]);

  const registerPanel = useCallback((level: number, el: HTMLElement | null) => {
    if (el) panelRefs.current.set(level, el);
    else panelRefs.current.delete(level);
  }, []);

  const registerItem = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const clearRest = () => {
    if (restTimer.current != null) {
      window.clearTimeout(restTimer.current);
      restTimer.current = null;
    }
  };

  const clearClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const applyPath = useCallback((next: string[], why: AimDecision) => {
    setPath(next);
    setDecision(why);
    if (next.length) setHoveredId(next[next.length - 1] ?? null);
  }, []);

  const openMenu = useCallback(() => {
    clearClose();
    setOpen(true);
    if (pathRef.current.length === 0) {
      const seed = initialPathRef.current;
      applyPath(seed.length ? seed : [], seed.length ? "switched" : "idle");
    }
  }, [applyPath]);

  const closeMenu = useCallback(() => {
    clearRest();
    setOpen(false);
    setBands([]);
    setDecision("closed");
  }, []);

  const computeBands = useCallback(
    (cursor: Point, currentPath: string[], inChildOf: Set<number>): AimBand[] => {
      const next: AimBand[] = [];
      for (let level = 0; level < currentPath.length; level++) {
        const childRect = readRect(panelRefs.current.get(level + 1));
        if (!childRect) continue;
        const parentId = currentPath[level];
        if (!parentId) continue;

        const itemRect = readRect(itemRefs.current.get(parentId));
        const confirmed = inChildOf.has(level + 1);
        const cursorVertex: Point = confirmed
          ? itemRect
            ? { x: itemRect.left + 12, y: (itemRect.top + itemRect.bottom) / 2 }
            : cursor
          : cursor;

        next.push({
          level,
          parentId,
          color: confirmed ? "confirm" : "predict",
          triangle: {
            cursor: cursorVertex,
            top: { x: childRect.left, y: childRect.top + 2 },
            bottom: { x: childRect.left, y: childRect.bottom - 2 },
          },
        });
      }
      return next;
    },
    [],
  );

  const hitTest = useCallback((p: Point): { panel: number | null; item: ItemHit | null; inside: boolean } => {
    let panel: number | null = null;
    let item: ItemHit | null = null;
    for (const [level, el] of panelRefs.current) {
      const rect = readRect(el);
      if (rect && pointInRect(p, rect, PANEL_PAD)) {
        if (panel == null || level > panel) panel = level;
      }
    }
    if (panel != null) {
      const slice = levelsFrom(treeRef.current, pathRef.current, localeRef.current)[panel];
      if (slice) {
        for (const node of slice.nodes) {
          const rect = readRect(itemRefs.current.get(node.id));
          if (rect && pointInRect(p, rect, 0)) {
            item = { level: panel, id: node.id };
            break;
          }
        }
      }
    }
    const root = readRect(rootRef.current);
    const inside = !!root && pointInRect(p, root, 8);
    return { panel, item, inside: inside || panel != null };
  }, []);

  const headingToBand = (prev: Point | undefined, curr: Point, band: AimBand): boolean => {
    if (!prev) return false;
    if (dist(prev, curr) < 1.2) return false;
    return predictsIntent(prev, curr, band.triangle.top, band.triangle.bottom, TRI_PAD);
  };

  const trySwitch = useCallback(
    (hit: ItemHit, cursor: Point, prev: Point | undefined, currentBands: AimBand[]) => {
      const current = pathRef.current;
      const existing = current[hit.level];
      if (existing === hit.id) {
        if (current.length > hit.level + 1) {
          const node = childrenOf(treeRef.current, current.slice(0, hit.level))?.find((n) => n.id === hit.id);
          if (!node?.children?.length) applyPath(current.slice(0, hit.level + 1), "switched");
        }
        return;
      }

      const protecting = currentBands.find((b) => b.level === hit.level);
      if (enabledRef.current && protecting && existing) {
        const childRect = readRect(panelRefs.current.get(hit.level + 1));
        if (childRect && pointInRect(cursor, childRect, 2)) {
          setDecision("confirmed");
          return;
        }

        if (headingToBand(prev, cursor, protecting)) {
          setDecision("protected");
          clearRest();
          restTimer.current = window.setTimeout(() => {
            const still = pathRef.current;
            if (still[hit.level] === existing) {
              applyPath([...still.slice(0, hit.level), hit.id], "switched");
            }
          }, restDelayRef.current);
          return;
        }
      }

      clearRest();
      applyPath([...current.slice(0, hit.level), hit.id], "switched");
    },
    [applyPath],
  );

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const kind: PointerKind =
        e.pointerType === "mouse" || e.pointerType === "touch" || e.pointerType === "pen"
          ? e.pointerType
          : "unknown";
      setPointerKind(kind);
      if (kind === "touch") return;

      const curr: Point = { x: e.clientX, y: e.clientY };
      const prev = history.current[0];
      history.current.push(curr);
      if (history.current.length > HISTORY) history.current.shift();
      setMouse(curr);

      if (!openRef.current) return;
      clearClose();

      const hit = hitTest(curr);
      const currentPath = pathRef.current;

      const inChildOf = new Set<number>();
      for (const [level, el] of panelRefs.current) {
        const rect = readRect(el);
        if (rect && pointInRect(curr, rect, 2) && level > 0) {
          for (let i = 0; i <= level; i++) inChildOf.add(i);
        }
      }

      const nextBands = computeBands(curr, currentPath, inChildOf);
      setBands(nextBands);

      if (hit.item) {
        setHoveredId(hit.item.id);
        trySwitch(hit.item, curr, prev, nextBands);
        return;
      }

      if (hit.panel != null) {
        setDecision(inChildOf.size ? "confirmed" : "idle");
        return;
      }

      const parentRect = readRect(panelRefs.current.get(0));
      const stillSafe =
        enabledRef.current &&
        nextBands.some((b) => {
          const childRect = readRect(panelRefs.current.get(b.level + 1));
          const parent = readRect(panelRefs.current.get(b.level)) ?? parentRect;
          if (parent && childRect && inGapBridge(curr, parent, childRect)) return true;
          if (prev && headingToBand(prev, curr, b)) return true;
          const itemRect = readRect(itemRefs.current.get(b.parentId));
          if (itemRect && childRect) {
            const origin = { x: itemRect.right, y: (itemRect.top + itemRect.bottom) / 2 };
            return pointInTriangle(curr, origin, b.triangle.top, b.triangle.bottom, 10);
          }
          return false;
        });

      if (stillSafe) {
        setDecision("protected");
        return;
      }

      closeTimer.current = window.setTimeout(() => {
        if (!openRef.current) return;
        const last = history.current[history.current.length - 1];
        if (!last) return;
        const again = hitTest(last);
        if (again.inside) return;
        closeMenu();
      }, CLOSE_GRACE);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      clearRest();
      clearClose();
    };
  }, [closeMenu, computeBands, hitTest, trySwitch]);

  const onItemClick = useCallback(
    (level: number, node: MenuNode) => {
      openMenu();
      const next = [...pathRef.current.slice(0, level), node.id];
      applyPath(next, "switched");
    },
    [applyPath, openMenu],
  );

  const resetDemo = useCallback(() => {
    clearRest();
    clearClose();
    setOpen(true);
    const seed = initialPathRef.current;
    applyPath(seed, "idle");
    setHoveredId(seed[seed.length - 1] ?? null);
    setBands([]);
  }, [applyPath]);

  const snapshot: CascadeState = {
    open,
    path,
    mouse,
    bands,
    decision,
    hoveredId,
    pointerKind,
  };

  return {
    snapshot,
    levels,
    coarse,
    rootRef,
    registerPanel,
    registerItem,
    openMenu,
    closeMenu,
    onItemClick,
    resetDemo,
    setOpen,
  };
}
