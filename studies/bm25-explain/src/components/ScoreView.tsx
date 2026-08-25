import { FormulaSheet } from "./FormulaSheet.tsx";
import { SaturationChart } from "./SaturationChart.tsx";
import {
  fmt,
  idfBreakdown,
  saturationBreakdown,
  sumContributions,
  topContribution,
} from "../lib/bm25/explain.ts";
import { useLocale } from "../lib/site-locale.ts";
import { useBundle, useLabStore } from "../lib/store.ts";
import { cn } from "../lib/utils.ts";

export function ScoreView() {
  const locale = useLocale();
  const bundle = useBundle();
  const documents = useLabStore((s) => s.documents);
  const selectedDocId = useLabStore((s) => s.selectedDocId);
  const setSelectedDocId = useLabStore((s) => s.setSelectedDocId);
  const k1 = useLabStore((s) => s.k1);
  const bVal = useLabStore((s) => s.b);
  const setK1 = useLabStore((s) => s.setK1);
  const setBParam = useLabStore((s) => s.setB);

  const hit = bundle.bm25.find((h) => h.docId === selectedDocId) ?? bundle.bm25[0];
  const doc = documents.find((d) => d.id === hit?.docId);
  const dl = hit ? (bundle.index.docLen.get(hit.docId) ?? 0) : 0;
  const avgdl = bundle.index.avgdl;
  const nDocs = bundle.index.nDocs;
  const length = saturationBreakdown(1, dl, avgdl, k1, bVal);
  const contribs = hit?.contributions ?? [];
  const maxC = Math.max(...contribs.map((c) => Math.abs(c.contribution)), 1e-9);
  const sum = sumContributions(hit);
  const peak = topContribution(contribs);
  const work = peak
    ? {
        term: peak,
        idf: idfBreakdown(nDocs, peak.df),
        sat: saturationBreakdown(peak.tf, dl, avgdl, k1, bVal),
      }
    : null;
  const vecHit = bundle.vector.find((h) => h.docId === hit?.docId);
  const scoreOk = hit ? Math.abs(sum - hit.score) < 1e-9 : true;

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Decompose scoring into three pillars: Term Frequency Saturation (k1), Inverse Document Frequency (IDF), and Length Normalization (b). Inspect exact numbers and live response curves below."
          : "公式拆开就三件事：词频饱和（k1）、逆文档频率 IDF、文档长度归一化（b）。下面用选中文档把数字代进去——分数来自哪几个词，当场验算。"}
      </p>

      <FormulaSheet />

      {/* Sliders & Response Curves */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5 rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-fg">
                {locale === "en" ? "k1 Term Frequency Saturation" : "k1 词频饱和参数"}
              </label>
              <span className="font-mono text-xs text-bm25 font-bold">{k1.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={k1}
              onChange={(e) => setK1(Number.parseFloat(e.target.value))}
              className="bm25-range mt-2 w-full"
            />
            <p className="mt-1 text-[11px] text-fg-muted">
              {locale === "en"
                ? "k1 = 0 tests presence only (Boolean). Higher k1 expands saturation ceiling."
                : "k1 = 0 只问有没有（布尔匹配）；k1 越大，词频增益上限越高。默认 1.2。"}
            </p>
          </div>

          <div className="border-t border-border/60 pt-4">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-fg">
                {locale === "en" ? "b Document Length Penalty" : "b 文档篇幅惩罚"}
              </label>
              <span className="font-mono text-xs text-bm25 font-bold">{bVal.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={bVal}
              onChange={(e) => setBParam(Number.parseFloat(e.target.value))}
              className="bm25-range mt-2 w-full"
            />
            <p className="mt-1 text-[11px] text-fg-muted">
              {locale === "en"
                ? "b = 0 ignores length; b = 1 strictly scales penalty with |D|/avgdl. Default 0.75."
                : "b = 0 不管长短；b = 1 完全按 |D|/avgdl 惩罚。长文档霸榜时调大 b。"}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-fg">
            {locale === "en" ? "TF Saturation Curve vs Document Length" : "词频饱和曲线 vs 文档篇幅"}
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            {locale === "en"
              ? "Red: Base saturation (b=0). Blue dashed: Short doc (|D|=avgdl/4). Green dashed: Long doc (|D|=4×avgdl)."
              : "红线：基准饱和（b=0）。虚线蓝：短文（|D|=avgdl/4）。虚线绿：长文（|D|=4×avgdl）。"}
          </p>
          <div className="mt-3">
            <SaturationChart k1={k1} b={bVal} locale={locale} />
          </div>
        </div>
      </div>

      {/* Selected Doc & Live Breakdown */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={hit?.docId ?? ""}
          onChange={(e) => setSelectedDocId(e.target.value)}
          className="h-10 min-w-56 rounded-lg bg-surface border border-border px-3 text-xs text-fg shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/40 cursor-pointer font-medium"
        >
          {bundle.bm25.map((h) => {
            const d = documents.find((x) => x.id === h.docId);
            return (
              <option key={h.docId} value={h.docId}>
                #{h.rank} {d?.title ?? h.docId} · {locale === "en" ? "Score" : "得分"} {fmt(h.score)}
              </option>
            );
          })}
        </select>
        <p className="break-words font-mono text-xs text-fg-muted">
          |D| = {dl} · avgdl = {fmt(avgdl, 1)} · |D|/avgdl = {fmt(length.lengthRatio, 2)} · K = {fmt(length.K)}
        </p>
      </div>

      <div className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-fg">{doc?.title ?? (locale === "en" ? "No selection" : "未选择")}</h2>
        <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-bm25">{fmt(hit?.score ?? 0)}</p>
        <p className="mt-1 font-mono text-xs text-fg-muted">
          {locale === "en"
            ? `Σ Term contributions = ${fmt(sum)} ${scoreOk ? "(= BM25 strictly equals)" : "(≠ score)"}`
            : `Σ 各项贡献之和 = ${fmt(sum)} ${scoreOk ? "（＝ BM25 严格相等）" : "（≠ score，请检查）"}`}
        </p>
        {hit && hit.score === 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            {locale === "en"
              ? `None of the query terms matched this doc, so every term contribution is 0.${vecHit && (vecHit.cosine ?? 0) > 0.05 ? ` Toy vector cosine is ${fmt(vecHit.cosine ?? 0)} (semantic neighbor missed by sparse keyword match).` : ""}`
              : `这篇一个查询词都没对上，每一项贡献都是 0。${vecHit && (vecHit.cosine ?? 0) > 0.05 ? ` 向量余弦却是 ${fmt(vecHit.cosine ?? 0)}——意思近、词不对，BM25 就是看不见。` : " BM25 默认是 OR：缺词只让该项为 0，并不是整篇被丢弃。"}`}
          </p>
        ) : (
          <p className="mt-2 text-xs text-fg-muted">
            {locale === "en"
              ? "Missing query terms contribute 0 to the sum rather than disqualifying the whole document (Lucene default SHOULD / OR)."
              : "缺的查询词贡献为 0，不等于整篇出局。这是 Lucene / ES 的 SHOULD（OR），不是必须全中。"}
          </p>
        )}
      </div>

      {/* Hand calculation walkthrough */}
      {work ? (
        <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-fg">
            {locale === "en"
              ? `Hand Calculation Step-by-Step · Top Term "${work.term.term}"`
              : `手算验算 · 核心命中词「${work.term.term}」`}
          </h2>
          <p className="mt-1 text-xs text-fg-muted font-mono">
            N = {nDocs} · df = {work.term.df} · tf = {work.term.tf} · k1 = {k1.toFixed(1)} · b = {bVal.toFixed(2)}
          </p>
          <div className="mt-4 space-y-4 overflow-x-auto font-mono text-xs leading-relaxed text-fg bg-surface-2/40 p-4 rounded-lg border border-border">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-fg-muted uppercase">
                {locale === "en" ? "1 · Compute Inverse Document Frequency (IDF)" : "1 · 计算 IDF 逆文档频率"}
              </p>
              <p className="mt-1 text-xs">
                ln(1 + ({nDocs} − {work.term.df} + 0.5) / ({work.term.df} + 0.5))
              </p>
              <p className="text-xs font-bold text-accent">
                = ln(1 + {fmt(work.idf.num, 1)} / {fmt(work.idf.den, 1)}) = {fmt(work.idf.lucene)}
              </p>
              <p className="mt-1 text-[11px] text-fg-muted">
                {locale === "en"
                  ? `Robertson original formula ln(${fmt(work.idf.num, 1)}/${fmt(work.idf.den, 1)}) = ${fmt(work.idf.robertson)}${work.idf.robertson < 0 ? " (negative)" : ""}. Lucene adds +1 to keep it strictly non-negative.`
                  : `Robertson 原版公式 ln(${fmt(work.idf.num, 1)}/${fmt(work.idf.den, 1)}) = ${fmt(work.idf.robertson)}${work.idf.robertson < 0 ? "（已为负数）" : ""}。Lucene 加了 1，恒正。`}
              </p>
            </div>
            <div className="border-t border-border/60 pt-3">
              <p className="text-[11px] font-bold tracking-wider text-fg-muted uppercase">
                {locale === "en" ? "2 · Compute Length Normalization Factor K" : "2 · 计算长度调节因子 K"}
              </p>
              <p className="mt-1 text-xs">
                {k1.toFixed(1)} × (1 − {bVal.toFixed(2)} + {bVal.toFixed(2)} × {dl}/{fmt(avgdl, 1)})
              </p>
              <p className="text-xs font-bold text-accent">
                = {k1.toFixed(1)} × {fmt(1 - bVal + bVal * length.lengthRatio)} = {fmt(work.sat.K)}
              </p>
            </div>
            <div className="border-t border-border/60 pt-3">
              <p className="text-[11px] font-bold tracking-wider text-fg-muted uppercase">
                {locale === "en" ? "3 · Compute TF Saturation Term TF_norm" : "3 · 计算词频饱和项 TF_norm"}
              </p>
              <p className="mt-1 text-xs">
                {work.term.tf} × ({k1.toFixed(1)}+1) / ({work.term.tf} + {fmt(work.sat.K)})
              </p>
              <p className="text-xs font-bold text-accent">
                = {fmt(work.term.tf * (k1 + 1))} / {fmt(work.sat.denom)} = {fmt(work.sat.tfSat)}
              </p>
            </div>
            <div className="border-t border-border/60 pt-3">
              <p className="text-[11px] font-bold tracking-wider text-fg-muted uppercase">
                {locale === "en" ? "4 · Term Contribution" : "4 · 单项贡献 Contribution"}
              </p>
              <p className="mt-1 text-xs font-bold text-bm25">
                IDF × TF_norm = {fmt(work.idf.lucene)} × {fmt(work.sat.tfSat)} = {fmt(work.term.contribution)}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Contributions table */}
      <div className="min-w-0 overflow-x-auto rounded-xl bg-surface border border-border shadow-sm">
        <table className="w-full min-w-2xl text-left text-xs">
          <thead className="border-b border-border bg-surface-2/40 text-[11px] tracking-wide text-fg-muted uppercase font-semibold">
            <tr>
              <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Query Term q_i" : "查询词 q_i"}</th>
              <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Term Freq tf" : "词频 tf"}</th>
              <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Doc Freq df" : "文档频 df"}</th>
              <th className="px-4 py-2.5 font-semibold">IDF</th>
              <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "tf Saturated" : "tf 饱和项"}</th>
              <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Term Score (IDF × tfNorm)" : "项得分 (IDF × 饱和)"}</th>
            </tr>
          </thead>
          <tbody>
            {contribs.map((c) => (
              <tr key={c.term} className="border-b border-border/60">
                <td className="px-4 py-2.5 font-mono font-medium text-fg">{c.term}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums">{c.tf}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums">{c.df}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums">{fmt(c.idf)}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums">{fmt(c.tfNorm)}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn("h-full rounded-full", c.tf > 0 ? "bg-bm25" : "bg-border")}
                        style={{ width: `${Math.max(c.tf > 0 ? 8 : 0, (c.contribution / maxC) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-bm25">{fmt(c.contribution)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {contribs.length > 0 ? (
            <tfoot>
              <tr className="bg-surface-2/50 font-semibold">
                <td className="px-4 py-2.5 text-xs text-fg-muted" colSpan={5}>
                  {locale === "en"
                    ? `Σ All Term Contributions ${scoreOk ? "(= BM25 Total Score)" : ""}`
                    : `Σ 全部词项贡献累加 ${scoreOk ? "（＝ 总分 BM25 score）" : ""}`}
                </td>
                <td className="px-4 py-2.5 font-mono tabular-nums text-bm25 font-bold">{fmt(sum)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
