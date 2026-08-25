import { useState } from "react";
import { useLabStore, useBundle } from "../lib/store.ts";
import { fmt, insight, rrfBreakdown } from "../lib/bm25/explain.ts";
import { PRESET_QUERIES } from "../lib/bm25/corpus.ts";
import { useLocale } from "../lib/site-locale.ts";
import { HitList } from "./HitList.tsx";
import { cn } from "../lib/utils.ts";
import type { RankedHit } from "../lib/bm25/types.ts";

type Lane = "bm25" | "vector" | "hybrid";

function pickHits(hits: RankedHit[], kind: Lane): { keep: RankedHit[]; rest: number } {
  if (kind === "bm25" || kind === "hybrid") {
    const keep = hits.filter((h) => h.score > 1e-9);
    return { keep, rest: hits.length - keep.length };
  }
  const max = hits[0]?.score ?? 0;
  const keep = hits.filter((h, i) => i < 5 || (max > 0 && h.score >= max * 0.4));
  return { keep, rest: Math.max(0, hits.length - keep.length) };
}

function fusionLine(bundle: ReturnType<typeof useBundle>, locale: "zh" | "en"): string | null {
  const topH = bundle.hybrid[0];
  if (!topH || !bundle.query) return null;
  if (bundle.fusion === "rrf") {
    const r = rrfBreakdown(bundle.rrfK, topH.bm25Rank, topH.vectorRank);
    const b = r.bm25Rank != null ? `1/(${r.k}+${r.bm25Rank})` : "0";
    const v = r.vectorRank != null ? `1/(${r.k}+${r.vectorRank})` : "0";
    return locale === "en"
      ? `RRF = ${b} + ${v} = ${fmt(r.bm25Term, 4)} + ${fmt(r.vectorTerm, 4)} = ${fmt(r.score, 4)} (Rank-order scale ~1/k; incomparable with raw BM25 score ${fmt(bundle.bm25[0]?.score ?? 0)})`
      : `RRF = ${b} + ${v} = ${fmt(r.bm25Term, 4)} + ${fmt(r.vectorTerm, 4)} = ${fmt(r.score, 4)}。量级约 1/k，不能和 BM25 的 ${fmt(bundle.bm25[0]?.score ?? 0)} 比大小。`;
  }
  const w = bundle.bm25Weight;
  const bn = topH.bm25Norm ?? 0;
  const vn = topH.vectorNorm ?? 0;
  return locale === "en"
    ? `Max-norm = ${w.toFixed(2)}×${fmt(bn, 3)} + ${(1 - w).toFixed(2)}×${fmt(vn, 3)} = ${fmt(topH.score, 4)} (Each lane is divided by its maximum score before weighted sum).`
    : `最大值归一 = ${w.toFixed(2)}×${fmt(bn, 3)} + ${(1 - w).toFixed(2)}×${fmt(vn, 3)} = ${fmt(topH.score, 4)}。两路先各自除以最大值后再按权重相加。`;
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
  const math = fusionLine(bundle, locale);

  return (
    <div className="space-y-5">
      {/* Insight card */}
      <aside className="rounded-xl bg-surface px-4 py-4 border border-border shadow-sm sm:px-5">
        <p className="font-semibold text-xs text-bm25 tracking-wide uppercase">{card.kicker}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-fg font-medium">{card.body}</p>
        {hint ? <p className="mt-2 text-xs text-fg-muted leading-relaxed">{hint}</p> : null}
        {math ? (
          <p className="mt-3 border-t border-border/60 pt-2.5 font-mono text-xs text-fg-muted leading-relaxed">
            {math}
          </p>
        ) : null}
      </aside>

      {/* Fusion Controls Bar */}
      <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-semibold text-fg">
              {locale === "en" ? "Hybrid Fusion Strategy" : "双路融合策略"}
            </h2>
            <p className="mt-0.5 text-[11px] text-fg-muted">
              {locale === "en"
                ? "Never add raw BM25 and cosine scores directly; fuse ranks via RRF or normalize by max values."
                : "稀疏与向量分数不可直接相加；走 RRF 位次融合或按各路最大值归一。"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFusion("rrf")}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-colors border border-border cursor-pointer",
                fusion === "rrf" ? "bg-accent text-accent-fg border-transparent" : "bg-surface-2 text-fg-muted hover:text-fg",
              )}
            >
              {locale === "en" ? "RRF Rank Fusion" : "RRF 排名倒数融合"}
            </button>
            <button
              type="button"
              onClick={() => setFusion("weighted")}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-colors border border-border cursor-pointer",
                fusion === "weighted" ? "bg-accent text-accent-fg border-transparent" : "bg-surface-2 text-fg-muted hover:text-fg",
              )}
            >
              {locale === "en" ? "Max-norm Weighted" : "最大值归一加权"}
            </button>
          </div>
        </div>

        <div className="mt-3 border-t border-border/60 pt-3">
          {fusion === "rrf" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center justify-between gap-2 sm:w-48">
                <span className="text-xs text-fg-muted">
                  {locale === "en" ? "RRF parameter k" : "RRF 排名常数 k"}
                </span>
                <span className="font-mono text-xs font-bold text-accent">{rrfK}</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={rrfK}
                onChange={(e) => setRrfK(Number.parseInt(e.target.value, 10))}
                className="bm25-range flex-1"
              />
              <span className="text-[11px] text-fg-subtle">
                {locale === "en" ? "score = 1/(k+rank_bm25) + 1/(k+rank_vec)" : "打分 = 1/(k+rank_bm25) + 1/(k+rank_vec)"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center justify-between gap-2 sm:w-48">
                <span className="text-xs text-fg-muted">
                  {locale === "en" ? "BM25 weight ratio α" : "BM25 权重占比 α"}
                </span>
                <span className="font-mono text-xs font-bold text-accent">{bm25Weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={bm25Weight}
                onChange={(e) => setBm25Weight(Number.parseFloat(e.target.value))}
                className="bm25-range flex-1"
              />
              <span className="text-[11px] text-fg-subtle">
                {locale === "en" ? `Vector weight 1−α = ${(1 - bm25Weight).toFixed(2)}` : `向量权重 1−α = ${(1 - bm25Weight).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Mobile lane toggle */}
      <div className="flex rounded-xl bg-surface-2 p-1 sm:hidden">
        {(
          [
            ["bm25", locale === "en" ? "BM25 Sparse" : "BM25 稀疏"],
            ["vector", locale === "en" ? "Toy Vector" : "概念向量"],
            ["hybrid", locale === "en" ? "Hybrid Fusion" : "混合融合"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setLane(id)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer",
              lane === id ? "bg-surface text-fg shadow-xs" : "text-fg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3 Columns */}
      <div className="grid gap-4 sm:grid-cols-3">
        <section
          className={cn(
            "rounded-xl bg-surface p-4 border border-border shadow-sm sm:block sm:p-5",
            lane !== "bm25" && "hidden sm:block",
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-fg">
              {locale === "en" ? "BM25 · Postings Inverted" : "BM25 · 词频倒排"}
            </h2>
            <span className="font-mono text-xs text-bm25 font-semibold">
              {locale === "en" ? `${bm25.keep.length} hits` : `${bm25.keep.length} 篇命中`}
            </span>
          </div>
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">
            {locale === "en"
              ? "Exact terms, identifiers, rare tokens. Default SHOULD (OR scoring)."
              : "精确词、标识符、专有名词、短文档优先。默认 SHOULD（OR 打分）。"}
          </p>
          <div className="mt-3">
            <HitList
              hits={bm25.keep}
              docs={documents}
              tone="bm25"
              scoreLabel={(h) => fmt(h.score)}
              rest={bm25.rest}
            />
          </div>
        </section>

        <section
          className={cn(
            "rounded-xl bg-surface p-4 border border-border shadow-sm sm:block sm:p-5",
            lane !== "vector" && "hidden sm:block",
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-fg">
              {locale === "en" ? "Toy Vector · Semantic Mock" : "玩具向量 · 语义近邻模拟"}
            </h2>
            <span className="font-mono text-xs text-vector font-semibold">
              {locale === "en" ? "Cosine Similarity" : "余弦相似度"}
            </span>
          </div>
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">
            {locale === "en"
              ? "Synonyms & semantic concepts (offline transparent concept space, not a neural model)."
              : "同义词（营收 ≈ 收入）、问句与概念概括（完全透明的离线概念空间，非黑盒模型）。"}
          </p>
          <div className="mt-3">
            <HitList
              hits={vector.keep}
              docs={documents}
              tone="vector"
              scoreLabel={(h) => (h.cosine != null ? fmt(h.cosine, 3) : fmt(h.score, 3))}
              rest={vector.rest}
            />
          </div>
        </section>

        <section
          className={cn(
            "rounded-xl bg-surface p-4 border border-border shadow-sm sm:block sm:p-5",
            lane !== "hybrid" && "hidden sm:block",
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-fg">
              {locale === "en" ? "Hybrid · Multi-lane Fusion" : "混合 · 两路融合"}
            </h2>
            <span className="font-mono text-xs text-accent font-semibold">
              {bundle.fusion === "rrf"
                ? `RRF k=${bundle.rrfK}`
                : locale === "en"
                  ? `Max-norm α=${bundle.bm25Weight}`
                  : `最大值归一 α=${bundle.bm25Weight}`}
            </span>
          </div>
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">
            {locale === "en"
              ? "BM25 exact match + Vector generalization, fusing distinct score scales."
              : "BM25 精确命中 + 向量泛化召回，融合不同量纲排序。"}
          </p>
          <div className="mt-3">
            <HitList
              hits={hybrid.keep}
              docs={documents}
              tone="accent"
              scoreLabel={(h) => (bundle.fusion === "rrf" ? fmt(h.score, 4) : fmt(h.score, 3))}
              rest={hybrid.rest}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
