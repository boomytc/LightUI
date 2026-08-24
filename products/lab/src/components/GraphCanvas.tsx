import { useEffect, useRef, useState } from "react";
import { getStudyCategory } from "../lib/categories";
import {
  afterEdges,
  contrastPairs,
  graphLevels,
  lineageOf,
} from "../lib/graph";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
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
};

function boxOf(el: HTMLElement, root: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return { x: r.left - root.left, y: r.top - root.top, w: r.width, h: r.height };
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
    } else {
      // Contrast arc
      const x1 = from.x + from.w / 2;
      const y1 = from.y + from.h;
      const x2 = to.x + to.w / 2;
      const y2 = to.y + to.h;
      const arc = Math.max(y1, y2) + 30;
      return `M ${x1} ${y1} C ${x1} ${arc}, ${x2} ${arc}, ${x2} ${y2}`;
    }
  }

  // Mobile vertical stacking
  if (type === "after") {
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    const mid = y1 + Math.max(20, (y2 - y1) / 2);
    return `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
  } else {
    const x1 = from.x + from.w;
    const y1 = from.y + from.h / 2;
    const x2 = to.x + to.w;
    const y2 = to.y + to.h / 2;
    const arc = Math.max(x1, x2) + 30;
    return `M ${x1} ${y1} C ${arc} ${y1}, ${arc} ${y2}, ${x2} ${y2}`;
  }
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
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches,
  );
  const [hoverSlug, setHoverSlug] = useState<string | undefined>(undefined);
  const [edges, setEdges] = useState<DrawnEdge[]>([]);

  const activeSlug = hoverSlug ?? selectedSlug;
  const lineage = activeSlug ? lineageOf(activeSlug, studies) : null;
  const levels = graphLevels(studies);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
      for (const edge of afterEdges(studies)) {
        const from = boxes[edge.from];
        const to = boxes[edge.to];
        if (!from || !to) continue;
        const edgeKey = `after:${edge.from}>${edge.to}`;
        const isHot = !activeSlug || (lineage?.allActiveEdges.has(edgeKey) ?? false);
        drawn.push({
          key: edgeKey,
          d: calcPath(from, to, wide, "after"),
          from: edge.from,
          to: edge.to,
          type: "after",
          hot: isHot,
          when: edge.when,
          whenEn: edge.whenEn,
        });
      }

      // 2. Contrast Edges (Dashed)
      for (const pair of contrastPairs(studies)) {
        const from = boxes[pair.a];
        const to = boxes[pair.b];
        if (!from || !to) continue;
        const edgeKey = `contrast:${pair.a}<>${pair.b}`;
        const isHot = !activeSlug || (lineage?.allActiveEdges.has(edgeKey) ?? false);
        drawn.push({
          key: edgeKey,
          d: calcPath(from, to, wide, "contrast"),
          from: pair.a,
          to: pair.b,
          type: "contrast",
          hot: isHot,
          when: pair.when,
          whenEn: pair.whenEn,
        });
      }

      setEdges(drawn);
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
  }, [studies, wide, activeSlug, lineage]);

  if (levels.length === 0) {
    return <p className="text-[14px] text-fg-subtle">{copy.graphEmpty}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] text-fg-subtle">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-accent rounded-full" />
            <span className="text-fg-muted font-medium">{copy.flowLegend}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 border-b-2 border-dashed border-rose-400" />
            <span className="text-fg-muted font-medium">{copy.contrastLegend}</span>
          </span>
        </div>
        <span>{copy.graphHint}</span>
      </div>

      {/* Main Canvas Frame */}
      <div
        ref={rootRef}
        className="relative overflow-x-auto rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-xs"
      >
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
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
            const opacity = activeSlug ? (edge.hot ? 1 : 0.12) : (isContrast ? 0.35 : 0.7);
            const strokeWidth = edge.hot && activeSlug ? 2.5 : 1.5;

            return (
              <path
                key={edge.key}
                d={edge.d}
                fill="none"
                strokeDasharray={isContrast ? "5 4" : undefined}
                className={isContrast ? "stroke-rose-400" : "stroke-accent"}
                opacity={opacity}
                strokeWidth={strokeWidth}
                markerEnd={isContrast ? undefined : edge.hot && activeSlug ? "url(#graph-arrow)" : "url(#graph-arrow-faded)"}
              />
            );
          })}
        </svg>

        {/* Node Layers */}
        <div className="relative z-10 flex min-w-max flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-14">
          {levels.map((level, levelIdx) => (
            <div
              key={levelIdx}
              className="flex flex-col gap-4 w-60 shrink-0"
            >
              <div className="flex items-center gap-2 px-1">
                <span className="font-mono text-[11px] font-semibold text-fg-subtle">
                  L{levelIdx + 1}
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              {level.map((meta) => {
                const isCurrent = activeSlug === meta.slug;
                const isSelected = selectedSlug === meta.slug;
                const isInLineage = lineage?.allActiveNodes.has(meta.slug) ?? false;
                const isAncestor = lineage?.ancestors.has(meta.slug) ?? false;
                const isDescendant = lineage?.descendants.has(meta.slug) ?? false;
                const isContrast = lineage?.contrasts.includes(meta.slug) ?? false;

                const opacityClass = activeSlug
                  ? isCurrent || isInLineage
                    ? "opacity-100 scale-[1.02]"
                    : "opacity-30"
                  : "opacity-100";

                const category = getStudyCategory(meta.slug);
                const asks = studyAsks(meta, locale);

                return (
                  <div
                    key={meta.slug}
                    id={meta.slug}
                    ref={(el) => {
                      nodeRefs.current[meta.slug] = el;
                    }}
                    onMouseEnter={() => setHoverSlug(meta.slug)}
                    onMouseLeave={() => setHoverSlug(undefined)}
                    onClick={() => onSelectSlug(meta.slug)}
                    className={cn(
                      "group relative cursor-pointer rounded-xl border p-3.5 shadow-xs transition-all duration-150",
                      isSelected
                        ? "border-accent bg-accent/10 ring-2 ring-accent shadow-md"
                        : isCurrent
                          ? "border-fg bg-surface-2 shadow-sm"
                          : isAncestor
                            ? "border-accent/60 bg-accent/5 ring-1 ring-accent/40"
                            : isDescendant
                              ? "border-accent/60 bg-accent/5 ring-1 ring-accent/40"
                              : isContrast
                                ? "border-rose-400/60 bg-rose-500/5 ring-1 ring-rose-400/40"
                                : "border-border bg-bg hover:border-border-strong hover:bg-surface-2",
                      opacityClass,
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase text-fg-subtle">
                        {category}
                      </span>
                      {isAncestor ? (
                        <span className="font-mono text-[10px] text-accent font-semibold">前置</span>
                      ) : isDescendant ? (
                        <span className="font-mono text-[10px] text-accent font-semibold">后步</span>
                      ) : isContrast ? (
                        <span className="font-mono text-[10px] text-rose-500 font-semibold">对照</span>
                      ) : null}
                    </div>

                    <h4 className="mt-1.5 text-[14px] font-semibold tracking-tight text-fg group-hover:text-accent transition-colors">
                      {studyTitle(meta, locale)}
                    </h4>

                    {asks ? (
                      <p className="mt-1 text-[11px] leading-relaxed text-fg-muted line-clamp-2">
                        {asks}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
