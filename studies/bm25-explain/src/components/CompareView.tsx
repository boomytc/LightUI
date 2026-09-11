import { useState, type ReactNode } from "react";
import { useLabStore, useBundle } from "../lib/store.ts";
import { fmt, insight } from "../lib/bm25/explain.ts";
import { PRESET_QUERIES } from "../lib/bm25/corpus.ts";
import { useLocale } from "../lib/site-locale.ts";
import { HitList } from "./HitList.tsx";
import { ScaleCompare } from "./ScaleCompare.tsx";
import { cn } from "../lib/utils.ts";
import type { RankedHit } from "../lib/bm25/types.ts";

type Lane = "bm25" | "vector" | "hybrid";

function pickHits(hits: RankedHit[], kind: Lane): { keep: RankedHit[]; rest: number } {
  if (kind === "bm25" || kind === "hybrid") {
    const keep = hits.filter((h) => h.score > 1e-9);
    return { keep, rest: hits.length - keep.length };
  }
  const max = hits[0]?.score ?? 0;
  const keep = hits.filter((h, i) => h.score > 1e-9 && (i < 5 || (max > 0 && h.score >= max * 0.4)));
  return { keep, rest: Math.max(0, hits.length - keep.length) };
}

export function CompareView() {
  const locale = useLocale();
  const bundle = useBundle();
  const documents = useLabStore((s) => s.documents);
  const query = useLabStore((s) => s.query);
  const fusion = useLabStore((s) => s.fusion);
  const rrfK = useLabStore((s) => s.rrfK);
  const bm25Weight = useLabStore((s) => s.bm25Weight);
  const setFusion = useLabStore((s) => s.setFusion);
  const setRrfK = useLabStore((s) => s.setRrfK);
  const setBm25Weight = useLabStore((s) => s.setBm25Weight);

  const preset = PRESET_QUERIES.find((p) => p.q === query);
  const hint = preset ? (locale === "en" ? preset.hintEn : preset.hintZh) : null;
  const card = insight(bundle, documents, locale);
  const [lane, setLane] = useState<Lane>("bm25");
  const bm25 = pickHits(bundle.bm25, "bm25");
  const vector = pickHits(bundle.vector, "vector");
  const hybrid = pickHits(bundle.hybrid, "hybrid");

  return (
    <div className="space-y-5">
      <aside className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-card sm:px-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-bm25 uppercase">{card.kicker}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed font-medium text-fg">{card.body}</p>
        {hint ? <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{hint}</p> : null}
      </aside>

      <ScaleCompare bundle={bundle} locale={locale} />

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-fg">
              {locale === "en" ? "Fusion experiment" : "融合实验"}
            </h2>
            <p className="mt-0.5 text-[12px] text-fg-muted">
              {locale === "en"
                ? "Never add raw BM25 and cosine. Fuse ranks (RRF) or max-normalize first."
                : "稀疏与向量不可直接相加。走 RRF 位次，或先按各路最大值归一。"}
            </p>
          </div>
          <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setFusion("rrf")}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
                fusion === "rrf" ? "bg-fg text-surface" : "text-fg-muted hover:text-fg",
              )}
            >
              RRF
            </button>
            <button
              type="button"
              onClick={() => setFusion("weighted")}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
                fusion === "weighted" ? "bg-fg text-surface" : "text-fg-muted hover:text-fg",
              )}
            >
              {locale === "en" ? "Max-norm" : "最大值归一"}
            </button>
          </div>
        </div>

        <div className="mt-3 border-t border-border/70 pt-3">
          {fusion === "rrf" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-baseline justify-between gap-2 sm:w-44">
                <span className="text-[13px] text-fg-muted">
                  {locale === "en" ? "RRF k" : "RRF 常数 k"}
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-accent">{rrfK}</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={rrfK}
                onChange={(e) => setRrfK(Number.parseInt(e.target.value, 10))}
                className="bm25-range flex-1"
                style={{ ["--bm25-fill" as string]: `${rrfK}%` }}
              />
              <span className="font-mono text-[11px] text-fg-subtle">
                1/(k+rank<sub>B</sub>) + 1/(k+rank<sub>V</sub>)
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-baseline justify-between gap-2 sm:w-44">
                <span className="text-[13px] text-fg-muted">
                  {locale === "en" ? "BM25 α" : "BM25 权重 α"}
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-accent">
                  {bm25Weight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={bm25Weight}
                onChange={(e) => setBm25Weight(Number.parseFloat(e.target.value))}
                className="bm25-range flex-1"
                style={{ ["--bm25-fill" as string]: `${bm25Weight * 100}%` }}
              />
              <span className="font-mono text-[11px] text-fg-subtle">
                {locale === "en"
                  ? `vector 1−α = ${(1 - bm25Weight).toFixed(2)}`
                  : `向量 1−α = ${(1 - bm25Weight).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="flex rounded-xl bg-surface-2 p-1 sm:hidden">
        {(
          [
            ["bm25", locale === "en" ? "BM25" : "BM25 稀疏"],
            ["vector", locale === "en" ? "Vector" : "概念向量"],
            ["hybrid", locale === "en" ? "Hybrid" : "混合融合"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setLane(id)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-colors",
              lane === id ? "bg-surface text-fg shadow-card" : "text-fg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <LaneColumn
          hidden={lane !== "bm25"}
          title={locale === "en" ? "BM25 · inverted" : "BM25 · 词频倒排"}
          meta={locale === "en" ? `${bm25.keep.length} hits` : `${bm25.keep.length} 篇命中`}
          tone="bm25"
          blurb={
            locale === "en"
              ? "Exact terms, identifiers, short dense hits. Default SHOULD (OR)."
              : "精确词、标识符、短而密的命中。默认 SHOULD（OR）。"
          }
        >
          <HitList
            hits={bm25.keep}
            docs={documents}
            tone="bm25"
            scoreLabel={(h) => fmt(h.score)}
            rest={bm25.rest}
          />
        </LaneColumn>

        <LaneColumn
          hidden={lane !== "vector"}
          title={locale === "en" ? "Toy vector · cosine" : "玩具向量 · 余弦"}
          meta={locale === "en" ? "cosine" : "余弦相似度"}
          tone="vector"
          blurb={
            locale === "en"
              ? "Synonyms and concepts in a transparent offline space — not a neural model."
              : "同义词与概念（营收 ≈ 收入）。完全透明的离线空间，不是黑盒模型。"
          }
        >
          <HitList
            hits={vector.keep}
            docs={documents}
            tone="vector"
            scoreLabel={(h) => (h.cosine != null ? fmt(h.cosine, 3) : fmt(h.score, 3))}
            rest={vector.rest}
          />
        </LaneColumn>

        <LaneColumn
          hidden={lane !== "hybrid"}
          title={locale === "en" ? "Hybrid · fused" : "混合 · 两路融合"}
          meta={
            bundle.fusion === "rrf"
              ? `RRF k=${bundle.rrfK}`
              : locale === "en"
                ? `α=${bundle.bm25Weight}`
                : `最大值归一 α=${bundle.bm25Weight}`
          }
          tone="accent"
          blurb={
            locale === "en"
              ? "Exact match plus semantic recall, after the scales are made comparable."
              : "精确命中加语义召回，先让两路量纲可比，再融合。"
          }
        >
          <HitList
            hits={hybrid.keep}
            docs={documents}
            tone="accent"
            scoreLabel={(h) => (bundle.fusion === "rrf" ? fmt(h.score, 4) : fmt(h.score, 3))}
            rest={hybrid.rest}
          />
        </LaneColumn>
      </div>
    </div>
  );
}

function LaneColumn({
  hidden,
  title,
  meta,
  tone,
  blurb,
  children,
}: {
  hidden: boolean;
  title: string;
  meta: string;
  tone: "bm25" | "vector" | "accent";
  blurb: string;
  children: ReactNode;
}) {
  const metaColor = tone === "bm25" ? "text-bm25" : tone === "vector" ? "text-vector" : "text-accent";
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-card sm:block sm:p-5",
        hidden && "hidden sm:block",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
        <span className={cn("font-mono text-[11px] font-semibold", metaColor)}>{meta}</span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{blurb}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
