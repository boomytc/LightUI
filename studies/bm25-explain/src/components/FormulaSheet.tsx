import { useLocale } from "../lib/site-locale.ts";

export function FormulaSheet() {
  const locale = useLocale();
  return (
    <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
      <p className="font-mono text-xs tracking-widest text-bm25 uppercase font-semibold">
        Lucene BM25Similarity
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs leading-relaxed text-fg sm:text-sm">
          <tbody>
            <tr className="align-top border-b border-border/40">
              <th className="w-28 py-1.5 pr-3 font-semibold text-fg-muted">IDF(t)</th>
              <td className="py-1.5 font-mono">ln(1 + (N − df + 0.5) / (df + 0.5))</td>
            </tr>
            <tr className="align-top border-b border-border/40">
              <th className="py-1.5 pr-3 font-semibold text-fg-muted">K</th>
              <td className="py-1.5 font-mono">k1 · (1 − b + b · |D| / avgdl)</td>
            </tr>
            <tr className="align-top">
              <th className="py-1.5 pr-3 font-semibold text-fg-muted">score(D, Q)</th>
              <td className="py-1.5 font-mono">
                Σ IDF(q<sub>i</sub>) · [tf · (k1+1)] / (tf + K)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-fg-muted border-t border-border/50 pt-2.5">
        {locale === "en"
          ? "Elasticsearch / OpenSearch defaults to k1 = 1.2, b = 0.75. ln is the natural logarithm. Robertson's original IDF lacked the +1 inside, producing negative scores when df > N/2; Lucene added +1 to ensure strict non-negativity."
          : "Elasticsearch / OpenSearch 默认 k1 = 1.2、b = 0.75。ln 是自然对数。Robertson 原文 IDF 没有外面的 1，当 df 超过 N/2 时会变成负数；Lucene 加上 1，保证恒正。本实验台按此标准公式实现。"}
      </p>
    </section>
  );
}
