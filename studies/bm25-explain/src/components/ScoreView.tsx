import { useEffect, useMemo, useState } from "react";
import { FormulaSheet } from "./FormulaSheet.tsx";
import { SaturationChart } from "./SaturationChart.tsx";
import { ScoreLedger } from "./ScoreLedger.tsx";
import { DEFAULT_OPTIONS, search } from "../lib/bm25/engine.ts";
import {
  fmt,
  saturationBreakdown,
  topContribution,
} from "../lib/bm25/explain.ts";
import { useLocale } from "../lib/site-locale.ts";
import { useBundle, useLabStore } from "../lib/store.ts";
import { cn } from "../lib/utils.ts";

export function ScoreView() {
  const locale = useLocale();
  const bundle = useBundle();
  const documents = useLabStore((s) => s.documents);
  const query = useLabStore((s) => s.query);
  const selectedDocId = useLabStore((s) => s.selectedDocId);
  const setSelectedDocId = useLabStore((s) => s.setSelectedDocId);
  const k1 = useLabStore((s) => s.k1);
  const bVal = useLabStore((s) => s.b);
  const setK1 = useLabStore((s) => s.setK1);
  const setBParam = useLabStore((s) => s.setB);
  const rrfK = useLabStore((s) => s.rrfK);
  const subword = useLabStore((s) => s.subword);
  const dropStopwords = useLabStore((s) => s.dropStopwords);
  const fusion = useLabStore((s) => s.fusion);
  const bm25Weight = useLabStore((s) => s.bm25Weight);

  const selectedHit = bundle.bm25.find((h) => h.docId === selectedDocId);
  const hit =
    selectedHit && selectedHit.score > 1e-9
      ? selectedHit
      : (bundle.bm25.find((h) => h.score > 1e-9) ?? selectedHit ?? bundle.bm25[0]);
  const doc = documents.find((d) => d.id === hit?.docId);
  const dl = hit ? (bundle.index.docLen.get(hit.docId) ?? 0) : 0;
  const avgdl = bundle.index.avgdl;
  const nDocs = bundle.index.nDocs;
  const length = saturationBreakdown(1, dl, avgdl, k1, bVal);
  const contribs = hit?.contributions ?? [];
  const peak = topContribution(contribs);
  const [pinnedTerm, setPinnedTerm] = useState<string | null>(null);

  useEffect(() => {
    setPinnedTerm(null);
  }, [hit?.docId]);

  const focusTerm = pinnedTerm ?? peak?.term ?? null;
  const focus = contribs.find((c) => c.term === focusTerm) ?? peak;
  const vecHit = bundle.vector.find((h) => h.docId === hit?.docId);
  const atDefault = Math.abs(k1 - DEFAULT_OPTIONS.k1) < 1e-9 && Math.abs(bVal - DEFAULT_OPTIONS.b) < 1e-9;

  const baseline = useMemo(
    () =>
      search(documents, query, {
        k1: DEFAULT_OPTIONS.k1,
        b: DEFAULT_OPTIONS.b,
        rrfK,
        subword,
        dropStopwords,
        fusion,
        bm25Weight,
      }),
    [documents, query, rrfK, subword, dropStopwords, fusion, bm25Weight],
  );
  const baseHit = baseline.bm25.find((h) => h.docId === hit?.docId);
  const scoreDelta = (hit?.score ?? 0) - (baseHit?.score ?? 0);
  const rankDelta = (hit?.rank ?? 0) - (baseHit?.rank ?? 0);

  const live = focus
    ? {
        term: focus.term,
        idf: focus.idf,
        K: saturationBreakdown(focus.tf, dl, avgdl, k1, bVal).K,
        tfSat: focus.tfNorm,
        lengthRatio: length.lengthRatio,
        score: hit?.score ?? 0,
      }
    : null;

  const ranked = bundle.bm25.filter((h) => h.score > 1e-9 || h.docId === hit?.docId);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "The total is a ledger: IDF rarity × TF saturation (k1) × length penalty (b). Click a term, then twist the knobs — rank and share update on this document."
          : "总分是一本账：IDF 稀缺 × 词频饱和（k1）× 篇幅惩罚（b）。点开一个词，再拧参数——这篇的名次和份额当场变。"}
      </p>

      <FormulaSheet live={live} />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ranked.map((h) => {
          const d = documents.find((x) => x.id === h.docId);
          const on = h.docId === hit?.docId;
          return (
            <button
              key={h.docId}
              type="button"
              onClick={() => setSelectedDocId(h.docId)}
              className={cn(
                "min-w-36 shrink-0 rounded-2xl border px-3.5 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-border bg-surface-2/50 hover:bg-surface",
              )}
            >
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] text-fg-subtle tabular-nums">#{h.rank}</span>
                <span className="truncate text-[11px] text-fg-muted">{d?.title ?? h.docId}</span>
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight text-bm25">
                {fmt(h.score)}
              </p>
            </button>
          );
        })}
      </div>

      <ScoreLedger
        hit={hit}
        docTitle={doc?.title ?? ""}
        vecHit={vecHit}
        nDocs={nDocs}
        dl={dl}
        avgdl={avgdl}
        k1={k1}
        b={bVal}
        focusTerm={focusTerm}
        onFocusTerm={setPinnedTerm}
        locale={locale}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="space-y-5 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
              {locale === "en" ? "Parameter bench" : "参数实验台"}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {atDefault
                ? locale === "en"
                  ? "Now at Lucene defaults (k1 = 1.2, b = 0.75)."
                  : "当前即 Lucene 默认（k1 = 1.2，b = 0.75）。"
                : locale === "en"
                  ? `vs default: score ${signed(scoreDelta)} · rank ${rankDelta === 0 ? "unchanged" : rankDelta < 0 ? `↑${-rankDelta}` : `↓${rankDelta}`}`
                  : `相对默认：分数 ${signed(scoreDelta)} · 名次 ${rankDelta === 0 ? "不变" : rankDelta < 0 ? `升 ${-rankDelta}` : `降 ${rankDelta}`}`}
            </p>
          </div>

          <SliderField
            label={locale === "en" ? "k1 · TF saturation" : "k1 · 词频饱和"}
            value={k1}
            display={k1.toFixed(1)}
            min={0}
            max={3}
            step={0.1}
            fill={(k1 / 3) * 100}
            onChange={setK1}
            hint={
              locale === "en"
                ? "k1 = 0 is presence-only. Higher k1 raises the saturation ceiling. Default 1.2."
                : "k1 = 0 只问有没有；越大，词频增益上限越高。默认 1.2。"
            }
          />

          <div className="border-t border-border/70 pt-4">
            <SliderField
              label={locale === "en" ? "b · length penalty" : "b · 篇幅惩罚"}
              value={bVal}
              display={bVal.toFixed(2)}
              min={0}
              max={1}
              step={0.05}
              fill={bVal * 100}
              onChange={setBParam}
              hint={
                locale === "en"
                  ? "b = 0 ignores length; b = 1 scales fully with |D|/avgdl. Default 0.75."
                  : "b = 0 不管长短；b = 1 完全按 |D|/avgdl 惩罚。默认 0.75。"
              }
            />
          </div>

          <LengthMeter dl={dl} avgdl={avgdl} ratio={length.lengthRatio} locale={locale} K={length.K} />
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">
            {locale === "en" ? "Saturation vs length" : "饱和曲线 vs 篇幅"}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Solid: base (b=0). Blue dash: short (|D|=avgdl/4). Teal dash: long (|D|=4×avgdl). Disk: this document’s focused term."
              : "实线：基准（b=0）。蓝虚线：短文（|D|=avgdl/4）。青虚线：长文（|D|=4×avgdl）。实心点：这篇的当前词。"}
          </p>
          <div className="mt-3">
            <SaturationChart
              k1={k1}
              b={bVal}
              locale={locale}
              markTf={focus?.tf}
              markDl={dl}
              markAvgdl={avgdl}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  display,
  min,
  max,
  step,
  fill,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  fill: number;
  onChange: (n: number) => void;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-semibold text-fg">{label}</label>
        <span className="font-mono text-lg font-semibold tabular-nums text-bm25">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="bm25-range mt-2 w-full"
        style={{ ["--bm25-fill" as string]: `${fill}%` }}
      />
      <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{hint}</p>
    </div>
  );
}

function LengthMeter({
  dl,
  avgdl,
  ratio,
  locale,
  K,
}: {
  dl: number;
  avgdl: number;
  ratio: number;
  locale: "zh" | "en";
  K: number;
}) {
  const span = Math.max(avgdl * 2, dl, 1);
  const docPct = Math.min(100, (dl / span) * 100);
  const avgPct = Math.min(100, (avgdl / span) * 100);
  return (
    <div className="rounded-xl border border-border bg-surface-2/50 px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[12px] font-semibold text-fg">
          {locale === "en" ? "This document vs avgdl" : "这篇 vs 平均篇幅"}
        </p>
        <p className="font-mono text-[11px] tabular-nums text-fg-muted">
          |D|/avgdl = {fmt(ratio, 2)} · K = {fmt(K)}
        </p>
      </div>
      <div className="relative mt-2.5 h-2 rounded-full bg-border">
        <div className="bm25-bar-fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${docPct}%` }} />
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
          style={{ left: `${avgPct}%` }}
          title="avgdl"
        />
      </div>
      <p className="mt-2 font-mono text-[11px] tabular-nums text-fg-subtle">
        |D| = {dl}
        <span className="mx-1.5">·</span>
        avgdl = {fmt(avgdl, 1)}
        <span className="mx-1.5">·</span>
        {ratio < 1
          ? locale === "en"
            ? "shorter than average"
            : "短于平均"
          : ratio > 1
            ? locale === "en"
              ? "longer than average"
              : "长于平均"
            : locale === "en"
              ? "at average"
              : "等于平均"}
      </p>
    </div>
  );
}

function signed(n: number): string {
  if (Math.abs(n) < 5e-4) return "0";
  const body = fmt(Math.abs(n));
  return n > 0 ? `+${body}` : `−${body}`;
}
