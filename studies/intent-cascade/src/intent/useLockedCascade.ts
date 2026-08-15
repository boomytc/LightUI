import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { corridorTriangle, pinConfirmCursor, pinHoverCursor } from "../lib/pin";
import type { StageFixture } from "../lib/stage-fixtures";
import { useLocale } from "../lib/site-locale";
import { FILTER_TREE } from "../lib/menu-data";
import type { Point, Rect } from "../lib/geometry";
import type { AimBand } from "./types";
import { levelsFrom } from "./levels";

function readRect(el: Element | null | undefined): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

export function useLockedCascade(fixture: StageFixture) {
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Map<number, HTMLElement>>(new Map());
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [mouse, setMouse] = useState<Point | null>(null);
  const [bands, setBands] = useState<AimBand[]>([]);
  const [attempt, setAttempt] = useState(0);

  const levels = useMemo(() => levelsFrom(FILTER_TREE, fixture.path, locale), [fixture.path, locale]);

  const registerPanel = useCallback((level: number, el: HTMLElement | null) => {
    if (el) panelRefs.current.set(level, el);
    else panelRefs.current.delete(level);
  }, []);

  const registerItem = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  useLayoutEffect(() => {
    setAttempt(0);
  }, [fixture.id]);

  useLayoutEffect(() => {
    if (!fixture.pin) {
      setMouse(null);
      setBands([]);
      return;
    }

    const parent = readRect(itemRefs.current.get(fixture.pin.parent));
    const toward = readRect(itemRefs.current.get(fixture.pin.toward));
    const child = readRect(panelRefs.current.get(fixture.pin.childLevel));
    const mouseId = fixture.pin.mouseOn ?? (fixture.pin.color === "confirm" ? fixture.pin.toward : fixture.pin.parent);
    const mouseItem = readRect(itemRefs.current.get(mouseId));
    if (!parent || !toward || !child || !mouseItem) {
      if (attempt > 12) return;
      const id = requestAnimationFrame(() => setAttempt((n) => n + 1));
      return () => cancelAnimationFrame(id);
    }

    const confirmed = fixture.pin.color === "confirm";
    setMouse(confirmed ? pinConfirmCursor(child, toward) : pinHoverCursor(mouseItem, child));
    setBands([
      {
        level: fixture.pin.childLevel - 1,
        parentId: fixture.pin.parent,
        color: fixture.pin.color,
        triangle: corridorTriangle(child, parent),
      },
    ]);
  }, [attempt, fixture]);

  return {
    locale,
    levels,
    rootRef,
    frameRef,
    mouse,
    bands,
    hoveredId: fixture.hoveredId,
    path: fixture.path,
    showTriangles: Boolean(fixture.pin),
    registerPanel,
    registerItem,
  };
}
