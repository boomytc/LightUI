import { fmt } from "../lib/bm25/explain.ts";
import { useLocale } from "../lib/site-locale.ts";

export type FormulaLive = {
  term: string;
  idf: number;
  K: number;
  tfSat: number;
  lengthRatio: number;
  score: number;
};

export function FormulaSheet({ live }: { live?: FormulaLive | null }) {
  const locale = useLocale();

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] tracking-[0.14em] text-bm25 uppercase">
          Lucene BM25Similarity
        </p>
        {live ? (
          <p className="font-mono text-[11px] text-fg-subtle">
            {locale === "en" ? "plugged in" : "代入"} 「{live.term}」
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Pillar
          name="IDF(t)"
          formula="ln(1 + (N − df + 0.5) / (df + 0.5))"
          value={live ? fmt(live.idf) : null}
          note={
            locale === "en"
              ? "Rarer terms weigh more. Lucene adds +1 so IDF stays positive."
              : "出现越少越值钱。Lucene 比 Robertson 多加 1，恒正。"
          }
        />
        <Pillar
          name="K"
          formula="k1 · (1 − b + b · |D| / avgdl)"
          value={live ? fmt(live.K) : null}
          extra={
            live
              ? `|D|/avgdl = ${fmt(live.lengthRatio, 2)}`
              : null
          }
          note={
            locale === "en"
              ? "Length penalty. Short, complete hits get a natural boost."
              : "篇幅惩罚。短而命中完整的文档天然提权。"
          }
        />
        <Pillar
          name="score(D, Q)"
          formula="Σ IDF(qi) · [tf · (k1+1)] / (tf + K)"
          value={live ? fmt(live.score) : null}
          extra={live ? `TF_norm = ${fmt(live.tfSat)}` : null}
          note={
            locale === "en"
              ? "The total is a sum of term contributions, not a black box."
              : "总分是各词贡献之和，不是黑盒。"
          }
        />
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Elasticsearch / OpenSearch defaults: k1 = 1.2, b = 0.75. ln is natural log. Robertson’s original IDF omitted the outer +1 and went negative when df > N/2."
          : "Elasticsearch / OpenSearch 默认 k1 = 1.2、b = 0.75。ln 是自然对数。Robertson 原文 IDF 没有外面的 1，df 超过 N/2 时会变负。"}
      </p>
    </section>
  );
}

function Pillar({
  name,
  formula,
  value,
  extra,
  note,
}: {
  name: string;
  formula: string;
  value: string | null;
  extra?: string | null;
  note: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface-2/50 px-3.5 py-3">
      <p className="font-mono text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
        {name}
      </p>
      <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-fg">{formula}</p>
      {value ? (
        <p className="mt-2 font-mono text-xl font-semibold tabular-nums tracking-tight text-bm25">
          {value}
          {extra ? <span className="ml-2 text-[11px] font-medium text-fg-muted">{extra}</span> : null}
        </p>
      ) : null}
      <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{note}</p>
    </article>
  );
}
