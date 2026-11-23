import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, categoryLabel, getStudyCategory } from "../lib/categories";
import {
  afterEdges,
  contrastPairs,
  graphLevels,
  lineageOf,
} from "../lib/graph";
import { messages } from "../lib/i18n";
import { linkWhen, studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type Box = { x: number; y: number; w: number; h: number };

type DrawnEdge = {
  key: string;
  d: string;
  from: string;
  to: string;
  type: "after" | "contrast";
  hot: boolean;
  when?: string;
  whenEn?: string;
  mx: number;
  my: number;
};

function sameDrawnEdges(a: readonly DrawnEdge[], b: readonly DrawnEdge[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i]!;
    const right = b[i]!;
    if (
      left.key !== right.key ||
      left.d !== right.d ||
      left.hot !== right.hot ||
      left.mx !== right.mx ||
      left.my !== right.my
    ) {
      return false;
    }
  }
  return true;
}

function boxOf(el: HTMLElement, root: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return { x: r.left - root.left, y: r.top - root.top, w: r.width, h: r.height };
}

function isSameColumn(from: Box, to: Box): boolean {
  const cx1 = from.x + from.w / 2;
  const cx2 = to.x + to.w / 2;
  return Math.abs(cx1 - cx2) < 24;
}

function lateralBulge(y1: number, y2: number): number {
  return Math.min(64, 28 + Math.abs(y2 - y1) * 0.055);
}

function calcPath(from: Box, to: Box, wide: boolean, type: "after" | "contrast"): string {
  if (wide) {
    if (type === "after") {
      const x1 = from.x + from.w;
      const y1 = from.y + from.h / 2;
      const x2 = to.x;
      const y2 = to.y + to.h / 2;
      const mid = x1 + Math.max(32, (x2 - x1) / 2);
      return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
    }

    // Same-column contrast: route laterally along the right gutter instead of vertically through cards
    if (isSameColumn(from, to)) {
      const x1 = from.x + from.w;
      const y1 = from.y + from.h / 2;
      const x2 = to.x + to.w;
      const y2 = to.y + to.h / 2;
      const arcX = Math.max(x1, x2) + lateralBulge(y1, y2);
      return `M ${x1} ${y1} C ${arcX} ${y1}, ${arcX} ${y2}, ${x2} ${y2}`;
    }

    // Cross-column contrast arc
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y + to.h;
    const arc = Math.max(y1, y2) + 32;
    return `M ${x1} ${y1} C ${x1} ${arc}, ${x2} ${arc}, ${x2} ${y2}`;
  }

  // Mobile vertical stacking
  if (type === "after") {
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    const mid = y1 + Math.max(20, (y2 - y1) / 2);
    return `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
  }
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x + to.w;
  const y2 = to.y + to.h / 2;
  const arcX = Math.max(x1, x2) + lateralBulge(y1, y2);
  return `M ${x1} ${y1} C ${arcX} ${y1}, ${arcX} ${y2}, ${x2} ${y2}`;
}

function calcMid(from: Box, to: Box, wide: boolean, type: "after" | "contrast"): { x: number; y: number } {
  if (wide) {
    if (type === "after") {
      return {
        x: (from.x + from.w + to.x) / 2,
        y: (from.y + from.h / 2 + to.y + to.h / 2) / 2,
      };
    }
    if (isSameColumn(from, to)) {
      const x1 = from.x + from.w;
      const y1 = from.y + from.h / 2;
      const x2 = to.x + to.w;
      const y2 = to.y + to.h / 2;
      const arcX = Math.max(x1, x2) + lateralBulge(y1, y2);
      return {
        x: 0.25 * ((x1 + x2) / 2) + 0.75 * arcX,
        y: (y1 + y2) / 2,
      };
    }
    const y1 = from.y + from.h;
    const y2 = to.y + to.h;
    const arc = Math.max(y1, y2) + 32;
    return {
      x: (from.x + from.w / 2 + to.x + to.w / 2) / 2,
      y: 0.25 * ((y1 + y2) / 2) + 0.75 * arc,
    };
  }
  if (type === "after") {
    return {
      x: (from.x + from.w / 2 + to.x + to.w / 2) / 2,
      y: (from.y + from.h + to.y) / 2,
    };
  }
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x + to.w;
  const y2 = to.y + to.h / 2;
  const arcX = Math.max(x1, x2) + lateralBulge(y1, y2);
  return {
    x: 0.25 * ((x1 + x2) / 2) + 0.75 * arcX,
    y: (y1 + y2) / 2,
  };
}

export function GraphCanvas({
  studies,
  locale,
  selectedSlug,
  onSelectSlug,
}: {
  studies: StudyMeta[];
  locale: Locale;
  selectedSlug?: string;
  onSelectSlug: (slug: string) => void;
}) {
  const copy = messages(locale);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches,
  );
  const [hoverSlug, setHoverSlug] = useState<string | undefined>(undefined);
  const [edges, setEdges] = useState<DrawnEdge[]>([]);
  const [scrollFade, setScrollFade] = useState({ left: false, right: false });

  const activeSlug = hoverSlug ?? selectedSlug;
  const lineage = useMemo(
    () => (activeSlug ? lineageOf(activeSlug, studies) : null),
    [activeSlug, studies],
  );
  const levels = useMemo(() => graphLevels(studies), [studies]);
  const allAfterEdges = useMemo(() => afterEdges(studies), [studies]);
  const allContrastPairs = useMemo(() => contrastPairs(studies), [studies]);
  const outgoingRoots = useMemo(
    () => new Set(allAfterEdges.map((edge) => edge.from)),
    [allAfterEdges],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    function syncFade() {
      const el = scrollRef.current;
      if (!el) return;
      const left = el.scrollLeft > 4;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setScrollFade((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    }

    syncFade();
    scroller.addEventListener("scroll", syncFade, { passive: true });
    const ro = new ResizeObserver(syncFade);
    ro.observe(scroller);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => {
      scroller.removeEventListener("scroll", syncFade);
      ro.disconnect();
    };
  }, [levels, wide]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function measure() {
      const frame = rootRef.current;
      if (!frame) return;
      const origin = frame.getBoundingClientRect();
      const boxes: Record<string, Box> = {};
      for (const study of studies) {
        const el = nodeRefs.current[study.slug];
        if (el) boxes[study.slug] = boxOf(el, origin);
      }

      const drawn: DrawnEdge[] = [];

      // 1. After Edges (Solid)
      for (const edge of allAfterEdges) {
        const from = boxes[edge.from];
        const to = boxes[edge.to];
        if (!from || !to) continue;
        const edgeKey = `after:${edge.from}>${edge.to}`;
        const isHot = !activeSlug || (lineage?.allActiveEdges.has(edgeKey) ?? false);
        const mid = calcMid(from, to, wide, "after");
        drawn.push({
          key: edgeKey,
          d: calcPath(from, to, wide, "after"),
          from: edge.from,
          to: edge.to,
          type: "after",
          hot: isHot,
          when: edge.when,
          whenEn: edge.whenEn,
          mx: mid.x,
          my: mid.y,
        });
      }

      // 2. Contrast Edges (Dashed)
      for (const pair of allContrastPairs) {
        const from = boxes[pair.a];
        const to = boxes[pair.b];
        if (!from || !to) continue;
        const edgeKey = `contrast:${pair.a}<>${pair.b}`;
        const isHot = !activeSlug || (lineage?.allActiveEdges.has(edgeKey) ?? false);
        const mid = calcMid(from, to, wide, "contrast");
        drawn.push({
          key: edgeKey,
          d: calcPath(from, to, wide, "contrast"),
          from: pair.a,
          to: pair.b,
          type: "contrast",
          hot: isHot,
          when: pair.when,
          whenEn: pair.whenEn,
          mx: mid.x,
          my: mid.y,
        });
      }

      setEdges((previous) => (sameDrawnEdges(previous, drawn) ? previous : drawn));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    for (const study of studies) {
      const el = nodeRefs.current[study.slug];
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [studies, allAfterEdges, allContrastPairs, wide, activeSlug, lineage]);

  if (levels.length === 0) {
    return <p className="text-[14px] text-fg-subtle">{copy.graphEmpty}</p>;
  }

  function renderNode(meta: StudyMeta) {
    const isCurrent = activeSlug === meta.slug;
    const isSelected = selectedSlug === meta.slug;
    const isInLineage = lineage?.allActiveNodes.has(meta.slug) ?? false;
    const isAncestor = lineage?.ancestors.has(meta.slug) ?? false;
    const isDescendant = lineage?.descendants.has(meta.slug) ?? false;
    const isContrast = lineage?.contrasts.includes(meta.slug) ?? false;

    const opacityClass = activeSlug
      ? isCurrent || isInLineage
        ? "opacity-100"
        : "opacity-40"
      : "opacity-100";

    const category = getStudyCategory(meta);
    const asks = studyAsks(meta, locale);

    return (
      <button
        type="button"
        key={meta.slug}
        id={meta.slug}
        ref={(el) => {
          nodeRefs.current[meta.slug] = el;
        }}
        onMouseEnter={() => setHoverSlug(meta.slug)}
        onMouseLeave={() => setHoverSlug(undefined)}
        onClick={() => onSelectSlug(meta.slug)}
        className={cn(
          "group relative w-full cursor-pointer rounded-xl border p-3.5 text-left shadow-xs transition-[opacity,transform,border-color,background-color,box-shadow] duration-200",
          isSelected
            ? "border-accent bg-accent/10 ring-2 ring-accent shadow-md"
            : isCurrent
              ? "border-fg bg-surface-2 shadow-sm"
              : isAncestor
                ? "border-accent/60 bg-accent/5 ring-1 ring-accent/40"
                : isDescendant
                  ? "border-accent/60 bg-accent/5 ring-1 ring-accent/40"
                  : isContrast
                    ? "border-wrong/60 bg-wrong-soft ring-1 ring-wrong/40"
                    : "border-border bg-bg hover:border-border-strong hover:bg-surface-2",
          opacityClass,
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle">
            {categoryLabel(category, locale)}
          </span>
          {isAncestor ? (
            <span className="font-mono text-[10px] font-semibold text-accent">{copy.graphAncestor}</span>
          ) : isDescendant ? (
            <span className="font-mono text-[10px] font-semibold text-accent">{copy.graphDescendant}</span>
          ) : isContrast ? (
            <span className="font-mono text-[10px] font-semibold text-wrong">{copy.graphContrastBadge}</span>
          ) : null}
        </div>

        <h4 className="mt-1.5 text-[14px] font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
          {studyTitle(meta, locale)}
        </h4>

        {asks ? (
          <p className="mt-1 text-[11px] leading-relaxed text-fg-muted line-clamp-2">
            {asks}
          </p>
        ) : null}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12px] text-fg-subtle">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-accent" />
            <span className="font-medium text-fg-muted">{copy.flowLegend}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 border-b-2 border-dashed border-wrong" />
            <span className="font-medium text-fg-muted">{copy.contrastLegend}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden lg:inline">{copy.graphHint}</span>
          <span className="lg:hidden">{copy.graphHintMobile}</span>
          {scrollFade.right || scrollFade.left ? (
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted">
              {copy.graphScrollHint}
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Canvas Frame with horizontal scroll fade cues */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-gradient-to-r from-surface via-surface/75 to-transparent transition-opacity duration-200",
            scrollFade.left ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-30 w-12 bg-gradient-to-l from-surface via-surface/80 to-transparent transition-opacity duration-200",
            scrollFade.right ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollRef}
          className="relative max-w-full overflow-x-auto overscroll-x-contain p-6 pb-14 sm:p-10"
        >
          <div ref={rootRef} className="relative inline-block min-w-full pr-14 pb-10 lg:pr-20">
            <svg
              className="pointer-events-none absolute inset-0 size-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" className="fill-accent" />
                </marker>
                <marker id="graph-arrow-faded" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" className="fill-accent/30" />
                </marker>
              </defs>

              {edges.map((edge) => {
                const isContrast = edge.type === "contrast";
                const opacity = activeSlug ? (edge.hot ? 1 : 0.12) : isContrast ? 0.35 : 0.7;
                const strokeWidth = edge.hot && activeSlug ? 2.5 : 1.5;

                return (
                  <path
                    key={edge.key}
                    d={edge.d}
                    fill="none"
                    strokeDasharray={isContrast ? "5 4" : undefined}
                    className={isContrast ? "stroke-wrong" : "stroke-accent"}
                    opacity={opacity}
                    strokeWidth={strokeWidth}
                    markerEnd={
                      isContrast
                        ? undefined
                        : edge.hot && activeSlug
                          ? "url(#graph-arrow)"
                          : "url(#graph-arrow-faded)"
                    }
                  />
                );
              })}
            </svg>

            {activeSlug
              ? edges
                  .filter((edge) => edge.hot)
                  .map((edge) => {
                    const label = linkWhen(edge.when, edge.whenEn, locale);
                    if (!label) return null;
                    return (
                      <div
                        key={`${edge.key}-when`}
                        className={cn(
                          "graph-when pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2",
                          edge.type === "contrast" && "graph-when-contrast",
                        )}
                        style={{ left: edge.mx, top: edge.my }}
                      >
                        {label}
                      </div>
                    );
                  })
              : null}

            {/* Node Layers */}
            <div className="relative z-10 flex min-w-max flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
              {levels.map((level, levelIdx) => {
                const groupedByDomain =
                  level.length > 10
                    ? CATEGORIES.filter((cat) => cat.id !== "all")
                        .map((cat) => ({
                          id: cat.id,
                          label: locale === "en" ? cat.nameEn : cat.nameZh,
                          items: level
                            .filter((meta) => getStudyCategory(meta) === cat.id)
                            .sort((a, b) => {
                              const aOut = outgoingRoots.has(a.slug) ? 0 : 1;
                              const bOut = outgoingRoots.has(b.slug) ? 0 : 1;
                              return aOut - bOut || a.slug.localeCompare(b.slug);
                            }),
                        }))
                        .filter((group) => group.items.length > 0)
                    : null;

                return (
                  <div key={levelIdx} className="flex w-60 shrink-0 flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                      <span className="font-mono text-[11px] font-semibold text-fg-subtle">
                        L{levelIdx + 1}
                      </span>
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
                        {level.length}
                      </span>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>

                    {groupedByDomain ? (
                      <div className="space-y-6">
                        {groupedByDomain.map((group) => (
                          <div key={group.id} className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[11px] font-semibold text-fg-muted">
                                {group.label}
                              </span>
                              <span className="font-mono text-[10px] text-fg-subtle">
                                {group.items.length}
                              </span>
                            </div>
                            <div className="flex flex-col gap-3">
                              {group.items.map((meta) => renderNode(meta))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      level.map((meta) => renderNode(meta))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
