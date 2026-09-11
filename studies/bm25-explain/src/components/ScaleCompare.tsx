import { fmt, rrfBreakdown } from "../lib/bm25/explain.ts";
import type { RankedHit, SearchBundle } from "../lib/bm25/types.ts";
import type { Locale } from "../lib/site-locale.ts";
import { useLabStore } from "../lib/store.ts";
import { cn } from "../lib/utils.ts";

type Row = {
  id: string;
  title: string;
  bm25?: RankedHit;
  vector?: RankedHit;
  hybrid?: RankedHit;
};

function collectRows(
  bundle: SearchBundle,
  titles: Map<string, string>,
  selectedId?: string,
): Row[] {
  const ids = new Set<string>();
  for (const lane of [bundle.bm25, bundle.vector, bundle.hybrid]) {
    let kept = 0;
    for (const h of lane) {
      if (h.score > 1e-9) {
        ids.add(h.docId);
        kept += 1;
      }
      if (kept >= 6) break;
    }
  }
  if (selectedId) ids.add(selectedId);

  const bMap = new Map(bundle.bm25.map((h) => [h.docId, h]));
  const vMap = new Map(bundle.vector.map((h) => [h.docId, h]));
  const hMap = new Map(bundle.hybrid.map((h) => [h.docId, h]));

  return [...ids]
    .map((id) => ({
      id,
      title: titles.get(id) ?? id,
      bm25: bMap.get(id),
      vector: vMap.get(id),
      hybrid: hMap.get(id),
    }))
    .sort((a, b) => (a.hybrid?.rank ?? 99) - (b.hybrid?.rank ?? 99) || (a.bm25?.rank ?? 99) - (b.bm25?.rank ?? 99));
}

export function ScaleCompare({ bundle, locale }: { bundle: SearchBundle; locale: Locale }) {
  const documents = useLabStore((s) => s.documents);
  const selectedDocId = useLabStore((s) => s.selectedDocId);
  const setSelectedDocId = useLabStore((s) => s.setSelectedDocId);
  const titles = new Map(documents.map((d) => [d.id, d.title]));
  const rows = collectRows(bundle, titles, selectedDocId);
  const selected = rows.find((r) => r.id === selectedDocId);
  const selectedUseful =
    selected &&
    ((selected.bm25?.score ?? 0) > 1e-9 ||
      (selected.vector?.cosine ?? 0) > 0.05 ||
      (selected.hybrid?.score ?? 0) > 1e-9);
  const focus = selectedUseful ? selected : rows[0];
  const focusId = focus?.id;

  const bm25Score = focus?.bm25?.score ?? 0;
  const cosine = focus?.vector?.cosine ?? 0;
  const naive = bm25Score + cosine;
  const fusion = bundle.fusion;
  const math =
    fusion === "rrf"
      ? rrfBreakdown(bundle.rrfK, focus?.hybrid?.bm25Rank ?? focus?.bm25?.rank, focus?.hybrid?.vectorRank ?? focus?.vector?.rank)
      : null;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <p className="font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
          {locale === "en" ? "Three rulers · do not add" : "三把尺子 · 不能直接加"}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ScaleCard
            tone="bm25"
            label="BM25"
            unit={locale === "en" ? "unbounded ≥ 0" : "无界非负"}
            value={fmt(bm25Score)}
            hint={locale === "en" ? "IDF × saturated TF" : "IDF × 饱和词频"}
          />
          <ScaleCard
            tone="vector"
            label={locale === "en" ? "Cosine" : "余弦"}
            unit="[−1, 1]"
            value={fmt(cosine, 3)}
            hint={locale === "en" ? "toy concept space" : "玩具概念空间"}
          />
          <ScaleCard
            tone="accent"
            label={fusion === "rrf" ? "RRF" : locale === "en" ? "Max-norm" : "最大值归一"}
            unit={fusion === "rrf" ? `≈ 1/${bundle.rrfK}` : "[0, 1]"}
            value={fusion === "rrf" ? fmt(focus?.hybrid?.score ?? 0, 4) : fmt(focus?.hybrid?.score ?? 0, 3)}
            hint={
              fusion === "rrf"
                ? locale === "en"
                  ? "sum of reciprocal ranks"
                  : "倒数排名之和"
                : locale === "en"
                  ? "each lane ÷ its max"
                  : "各路先除以各自最大值"
            }
          />
        </div>

        {focus ? (
          <div className="mt-4 grid gap-3 border-t border-border/70 pt-4 lg:grid-cols-[1fr_1.15fr]">
            <div className="rounded-xl bg-wrong-soft/60 px-3.5 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-wrong uppercase">
                {locale === "en" ? "Illegal sum" : "错误加和"}
              </p>
              <p className="mt-1.5 font-mono text-sm tabular-nums text-fg">
                <span className="text-bm25">{fmt(bm25Score)}</span>
                <span className="mx-2 text-fg-subtle">+</span>
                <span className="text-vector">{fmt(cosine, 3)}</span>
                <span className="mx-2 text-fg-subtle">≠</span>
                <span className="font-semibold line-through decoration-wrong/70">{fmt(naive)}</span>
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                {locale === "en"
                  ? `“${focus.title}” — sparse and cosine live on different rulers.`
                  : `「${focus.title}」——稀疏与余弦不在同一把尺子上。`}
              </p>
            </div>

            <div className="rounded-xl bg-accent-soft/70 px-3.5 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">
                {locale === "en" ? "Legal fusion" : "合法融合"}
              </p>
              {fusion === "rrf" && math ? (
                <p className="mt-1.5 font-mono text-[13px] leading-relaxed tabular-nums text-fg">
                  <span className="text-fg-muted">1/({math.k}+{math.bm25Rank ?? "–"})</span>
                  <span className="mx-1.5 text-fg-subtle">+</span>
                  <span className="text-fg-muted">1/({math.k}+{math.vectorRank ?? "–"})</span>
                  <span className="mx-1.5 text-fg-subtle">=</span>
                  <span>{fmt(math.bm25Term, 4)}</span>
                  <span className="mx-1.5 text-fg-subtle">+</span>
                  <span>{fmt(math.vectorTerm, 4)}</span>
                  <span className="mx-1.5 text-fg-subtle">=</span>
                  <span className="font-semibold text-accent">{fmt(math.score, 4)}</span>
                </p>
              ) : (
                <p className="mt-1.5 font-mono text-[13px] leading-relaxed tabular-nums text-fg">
                  <span className="text-fg-muted">{bundle.bm25Weight.toFixed(2)}×{fmt(focus.hybrid?.bm25Norm ?? 0, 3)}</span>
                  <span className="mx-1.5 text-fg-subtle">+</span>
                  <span className="text-fg-muted">{(1 - bundle.bm25Weight).toFixed(2)}×{fmt(focus.hybrid?.vectorNorm ?? 0, 3)}</span>
                  <span className="mx-1.5 text-fg-subtle">=</span>
                  <span className="font-semibold text-accent">{fmt(focus.hybrid?.score ?? 0, 4)}</span>
                </p>
              )}
              <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                {fusion === "rrf"
                  ? locale === "en"
                    ? "RRF uses rank, not raw magnitude — incomparable with BM25 totals."
                    : "RRF 吃的是名次，不是绝对分，不能和 BM25 总分比大小。"
                  : locale === "en"
                    ? "Each lane is divided by its own maximum, then weighted."
                    : "两路先各自除以最大值，再按 α 加权。"}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
        <table className="w-full min-w-[36rem] text-left">
          <thead>
            <tr className="border-b border-border text-[11px] tracking-wide text-fg-subtle uppercase">
              <th className="px-4 py-2.5 font-medium">{locale === "en" ? "Document" : "文档"}</th>
              <th className="px-3 py-2.5 font-medium text-bm25">BM25</th>
              <th className="px-3 py-2.5 font-medium text-vector">
                {locale === "en" ? "Vector" : "向量"}
              </th>
              <th className="px-3 py-2.5 font-medium text-accent">
                {locale === "en" ? "Hybrid" : "融合"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const on = row.id === focusId;
              return (
                <tr
                  key={row.id}
                  className={cn(on ? "bg-accent-soft/50" : "hover:bg-surface-2/80")}
                >
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDocId(row.id)}
                      className={cn(
                        "text-left text-[13px]",
                        on ? "font-semibold text-fg" : "text-fg-muted hover:text-fg",
                      )}
                    >
                      {row.title}
                    </button>
                  </td>
                  <LaneCell hit={row.bm25} kind="bm25" fusion={bundle.fusion} />
                  <LaneCell hit={row.vector} kind="vector" fusion={bundle.fusion} />
                  <LaneCell hit={row.hybrid} kind="hybrid" fusion={bundle.fusion} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ScaleCard({
  tone,
  label,
  unit,
  value,
  hint,
}: {
  tone: "bm25" | "vector" | "accent";
  label: string;
  unit: string;
  value: string;
  hint: string;
}) {
  const color =
    tone === "bm25" ? "text-bm25" : tone === "vector" ? "text-vector" : "text-accent";
  return (
    <article className="rounded-xl border border-border bg-surface-2/50 px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className={cn("text-[11px] font-semibold tracking-wide uppercase", color)}>{label}</p>
        <p className="font-mono text-[10px] text-fg-subtle">{unit}</p>
      </div>
      <p className={cn("mt-1 font-mono text-[1.65rem] leading-none font-semibold tabular-nums tracking-tight", color)}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-fg-muted">{hint}</p>
    </article>
  );
}

function LaneCell({
  hit,
  kind,
  fusion,
}: {
  hit?: RankedHit;
  kind: "bm25" | "vector" | "hybrid";
  fusion: SearchBundle["fusion"];
}) {
  if (!hit || hit.score <= 1e-9) {
    return (
      <td className="px-3 py-2.5 font-mono text-[11px] text-fg-subtle tabular-nums">—</td>
    );
  }
  const score =
    kind === "vector"
      ? fmt(hit.cosine ?? hit.score, 3)
      : kind === "hybrid" && fusion === "rrf"
        ? fmt(hit.score, 4)
        : fmt(hit.score);
  const tone = kind === "bm25" ? "text-bm25" : kind === "vector" ? "text-vector" : "text-accent";
  return (
    <td className="px-3 py-2.5">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[10px] text-fg-subtle tabular-nums">#{hit.rank}</span>
        <span className={cn("font-mono text-sm font-semibold tabular-nums", tone)}>{score}</span>
      </div>
    </td>
  );
}
