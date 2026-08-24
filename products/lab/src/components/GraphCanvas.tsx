import { useEffect, useRef, useState } from "react";
import { afterEdges, contrastPairs, graphLevels, neighborsOf } from "../lib/graph";
import { messages } from "../lib/i18n";
import { linkWhen, studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";
import { Link } from "./Link";

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type Box = { x: number; y: number; w: number; h: number };

type DrawnEdge = {
  key: string;
  d: string;
  from: string;
  to: string;
  hot: boolean;
};

function boxOf(el: HTMLElement, root: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return { x: r.left - root.left, y: r.top - root.top, w: r.width, h: r.height };
}

function afterPath(from: Box, to: Box, wide: boolean): string {
  if (wide) {
    const x1 = from.x + from.w;
    const y1 = from.y + from.h / 2;
    const x2 = to.x;
    const y2 = to.y + to.h / 2;
    const mid = x1 + Math.max(36, (x2 - x1) / 2);
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  }
  const x1 = from.x + from.w / 2;
  const y1 = from.y + from.h;
  const x2 = to.x + to.w / 2;
  const y2 = to.y;
  const mid = y1 + Math.max(24, (y2 - y1) / 2);
  return `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
}

export function GraphCanvas({
  studies,
  locale,
  focus,
}: {
  studies: StudyMeta[];
  locale: Locale;
  focus?: string;
}) {
  const copy = messages(locale);
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches,
  );
  const [hover, setHover] = useState<string | undefined>(undefined);
  const [edges, setEdges] = useState<DrawnEdge[]>([]);

  const levels = graphLevels(studies);
  const active = hover ?? selected ?? (focus && studies.some((s) => s.slug === focus) ? focus : undefined);
  const focused = studies.find((s) => s.slug === active);
  const neighbors = active ? neighborsOf(active, studies) : [];
  const pairs = contrastPairs(studies);

  useEffect(() => {
    if (!focus) return;
    document.getElementById(focus)?.scrollIntoView({ block: "nearest" });
  }, [focus]);

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
      for (const edge of afterEdges(studies)) {
        const from = boxes[edge.from];
        const to = boxes[edge.to];
        if (!from || !to) continue;
        drawn.push({
          key: `${edge.from}>${edge.to}`,
          d: afterPath(from, to, wide),
          from: edge.from,
          to: edge.to,
          hot: !active || active === edge.from || active === edge.to,
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
  }, [studies, wide, active]);

  if (levels.length === 0) {
    return <p className="text-[14px] text-fg-subtle">{copy.graphEmpty}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-[12px] text-fg-subtle">
        <span className="inline-flex items-center gap-2">
          <span className="h-px w-6 bg-accent" />
          {copy.graphAfter}
        </span>
      </div>

      <div
        ref={rootRef}
        className="relative rounded-2xl border border-border bg-surface px-4 py-8 sm:px-8"
      >
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-accent" />
            </marker>
          </defs>
          {edges.map((edge) => (
            <path
              key={edge.key}
              d={edge.d}
              fill="none"
              className="stroke-accent"
              opacity={edge.hot ? 1 : 0.22}
              strokeWidth={edge.hot && active ? 2 : 1.5}
              markerEnd="url(#graph-arrow)"
            />
          ))}
        </svg>

        <div className="relative z-10 flex flex-col gap-14 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
          {levels.map((level, index) => (
            <div
              key={index}
              className={
                level.length > 1
                  ? "grid grid-cols-2 gap-3 lg:flex lg:w-64 lg:flex-col lg:gap-4"
                  : "flex justify-center lg:w-64"
              }
            >
              {level.map((meta) => {
                const on = active === meta.slug;
                const asks = studyAsks(meta, locale);
                return (
                  <div
                    key={meta.slug}
                    id={meta.slug}
                    ref={(el) => {
                      nodeRefs.current[meta.slug] = el;
                    }}
                    className="min-w-0 w-full"
                    onMouseEnter={() => setHover(meta.slug)}
                    onMouseLeave={() => setHover(undefined)}
                    onClick={() => setSelected((prev) => (prev === meta.slug ? undefined : meta.slug))}
                  >
                    <Link
                      href={`/s/${meta.slug}`}
                      className={cn(
                        "block rounded-2xl border bg-bg px-4 py-4 shadow-card no-underline transition-colors",
                        on ? "border-fg ring-2 ring-accent/20" : "border-border hover:border-border-strong",
                      )}
                    >
                      <h2 className="text-[16px] font-semibold tracking-tight text-fg">
                        {studyTitle(meta, locale)}
                      </h2>
                      {asks ? <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{asks}</p> : null}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {focused ? (
        <div className="rounded-2xl border border-border bg-surface px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-fg-subtle">{copy.graphAsks}</p>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelected(undefined)}
                className="text-[11px] text-accent hover:underline"
              >
                {locale === "en" ? "Clear selection" : "取消选中"}
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-[15px] font-medium">{studyTitle(focused, locale)}</p>
          {studyAsks(focused, locale) ? (
            <p className="mt-1 text-[13px] text-fg-muted">{studyAsks(focused, locale)}</p>
          ) : null}
          {neighbors.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {neighbors.map((item) => {
                const meta = studies.find((s) => s.slug === item.slug);
                if (!meta) return null;
                const rel =
                  item.rel === "before"
                    ? copy.graphBefore
                    : item.rel === "after"
                      ? copy.graphAfter
                      : copy.graphContrast;
                const when = linkWhen(item.when, item.whenEn, locale);
                return (
                  <li key={`${item.rel}-${item.slug}`} className="text-fg-muted">
                    <span className="text-fg-subtle">{rel}</span>
                    {when ? <span> · {when}</span> : null}
                    {" → "}
                    <Link href={`/s/${meta.slug}`} className="text-accent no-underline hover:underline">
                      {studyTitle(meta, locale)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="text-[12px] text-fg-subtle">{copy.graphHint}</p>
      )}

      {pairs.length > 0 ? (
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[13px] font-medium text-fg-muted">{copy.graphContrast}</h2>
            <span className="text-[12px] text-fg-subtle">{copy.graphPairs(pairs.length)}</span>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pairs.map((pair) => {
              const a = studies.find((s) => s.slug === pair.a);
              const b = studies.find((s) => s.slug === pair.b);
              if (!a || !b) return null;
              const when = linkWhen(pair.when, pair.whenEn, locale);
              return (
                <li
                  key={`${pair.a}|${pair.b}`}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-border-strong"
                >
                  {when ? <p className="text-[14px] font-medium leading-snug text-fg">{when}</p> : null}
                  <p className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
                    <Link
                      href={`/s/${a.slug}`}
                      className="rounded-full border border-border bg-bg px-2 py-0.5 text-fg-muted no-underline transition-colors hover:border-border-strong hover:text-accent"
                    >
                      {studyTitle(a, locale)}
                    </Link>
                    <span className="text-fg-subtle" aria-hidden="true">
                      ≠
                    </span>
                    <Link
                      href={`/s/${b.slug}`}
                      className="rounded-full border border-border bg-bg px-2 py-0.5 text-fg-muted no-underline transition-colors hover:border-border-strong hover:text-accent"
                    >
                      {studyTitle(b, locale)}
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
