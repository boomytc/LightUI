import {
  fmt,
  idfBreakdown,
  saturationBreakdown,
  sumContributions,
} from "../lib/bm25/explain.ts";
import type { RankedHit, TermContribution } from "../lib/bm25/types.ts";
import type { Locale } from "../lib/site-locale.ts";
import { cn } from "../lib/utils.ts";

export function ScoreLedger({
  hit,
  docTitle,
  vecHit,
  nDocs,
  dl,
  avgdl,
  k1,
  b,
  focusTerm,
  onFocusTerm,
  locale,
}: {
  hit?: RankedHit;
  docTitle: string;
  vecHit?: RankedHit;
  nDocs: number;
  dl: number;
  avgdl: number;
  k1: number;
  b: number;
  focusTerm: string | null;
  onFocusTerm: (term: string) => void;
  locale: Locale;
}) {
  const contribs = hit?.contributions ?? [];
  const sum = sumContributions(hit);
  const scoreOk = hit ? Math.abs(sum - hit.score) < 1e-9 : true;
  const maxC = Math.max(...contribs.map((c) => Math.abs(c.contribution)), 1e-9);
  const parts = contribs.filter((c) => c.contribution > 0);
  const focus = contribs.find((c) => c.term === focusTerm) ?? parts[0];
  const cosine = vecHit?.cosine ?? 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
            {locale === "en" ? "Term ledger · Σ = BM25" : "词贡献账本 · Σ = BM25"}
          </p>
          <h2 className="mt-1 truncate text-[1.05rem] font-semibold tracking-tight text-fg">
            {docTitle || (locale === "en" ? "No selection" : "未选择")}
          </h2>
        </div>
        {hit ? (
          <p className="font-mono text-[11px] tabular-nums text-fg-subtle">
            #{hit.rank}
            <span className="mx-1.5 text-border-strong">·</span>
            |D| {dl}
            <span className="mx-1.5 text-border-strong">·</span>
            avgdl {fmt(avgdl, 1)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-[11px] tracking-wide text-fg-subtle uppercase">
            {locale === "en" ? "BM25 total" : "BM25 总分"}
          </p>
          <p className="font-mono text-[2.35rem] leading-none font-semibold tracking-tight text-bm25 tabular-nums">
            {fmt(hit?.score ?? 0)}
          </p>
        </div>
        <div className="pb-1">
          <p className="text-[11px] tracking-wide text-fg-subtle uppercase">Σ</p>
          <p className="font-mono text-lg font-semibold tabular-nums text-fg">
            {fmt(sum)}
            <span className="ml-2 text-[11px] font-medium text-fg-muted">
              {scoreOk
                ? locale === "en"
                  ? "strictly equals"
                  : "严格相等"
                : locale === "en"
                  ? "≠ score"
                  : "≠ score，请检查"}
            </span>
          </p>
        </div>
      </div>

      {parts.length > 0 ? (
        <div className="mt-4">
          <div
            className="bm25-stack"
            role="img"
            aria-label={
              locale === "en"
                ? "Stacked term contributions that sum to BM25"
                : "各项词贡献堆叠后等于 BM25 总分"
            }
          >
            {parts.map((c) => {
              const on = focus?.term === c.term;
              return (
                <button
                  key={c.term}
                  type="button"
                  onClick={() => onFocusTerm(c.term)}
                  aria-pressed={on}
                  title={`${c.term} ${fmt(c.contribution)}`}
                  className={cn("bm25-stack-seg", on ? "is-on" : undefined)}
                  style={{ flexGrow: Math.max(c.contribution, 0.02) }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {parts.map((c) => (
              <button
                key={`leg-${c.term}`}
                type="button"
                onClick={() => onFocusTerm(c.term)}
                className={cn(
                  "font-mono text-[11px] tabular-nums transition-colors",
                  focus?.term === c.term ? "font-semibold text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {c.term}
                <span className="ml-1 text-fg-subtle">{pct(c.contribution, sum)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bm25-stack mt-4 opacity-40" aria-hidden="true" />
      )}

      {hit && hit.score === 0 ? (
        <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? `None of the query terms matched, so every contribution is 0.${cosine > 0.05 ? ` Toy vector cosine is ${fmt(cosine)} — a semantic neighbor the sparse lane cannot see.` : ""}`
            : `这篇一个查询词都没对上，每一项贡献都是 0。${cosine > 0.05 ? ` 向量余弦却是 ${fmt(cosine)}——意思近、词不对，BM25 就是看不见。` : " BM25 默认是 OR：缺词只让该项为 0，并不是整篇被丢弃。"}`}
        </p>
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "The total is the sum of named term scores. Missing terms add 0; they do not disqualify the document (Lucene SHOULD / OR)."
            : "总分是具名词项得分之和。缺的查询词贡献为 0，不等于整篇出局（Lucene SHOULD / OR）。"}
        </p>
      )}

      <ol className="mt-5 space-y-1.5">
        {contribs.map((c) => (
          <TermRow
            key={c.term}
            c={c}
            maxC={maxC}
            share={pct(c.contribution, sum)}
            active={focus?.term === c.term}
            onSelect={() => onFocusTerm(c.term)}
            locale={locale}
          />
        ))}
      </ol>

      {focus ? (
        <HandCalc
          term={focus}
          nDocs={nDocs}
          dl={dl}
          avgdl={avgdl}
          k1={k1}
          b={b}
          locale={locale}
        />
      ) : null}
    </section>
  );
}

function TermRow({
  c,
  maxC,
  share,
  active,
  onSelect,
  locale,
}: {
  c: TermContribution;
  maxC: number;
  share: string;
  active: boolean;
  onSelect: () => void;
  locale: Locale;
}) {
  const missed = c.tf === 0;
  const width = missed ? 0 : Math.max(8, (c.contribution / maxC) * 100);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-expanded={active}
        className={cn(
          "w-full rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
          active
            ? "border-border-strong bg-surface-2 shadow-card"
            : "border-transparent hover:bg-surface-2/70",
        )}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className={cn("font-mono text-sm font-semibold", missed ? "text-fg-subtle" : "text-fg")}>
            {c.term}
            {missed ? (
              <span className="ml-2 font-sans text-[11px] font-medium text-fg-subtle">
                {locale === "en" ? "miss · 0" : "未命中 · 0"}
              </span>
            ) : null}
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] tabular-nums text-fg-subtle">{share}</span>
            <span
              className={cn(
                "font-mono text-lg font-semibold tabular-nums tracking-tight",
                missed ? "text-fg-subtle" : "text-bm25",
              )}
            >
              {fmt(c.contribution)}
            </span>
          </span>
        </div>
        <div className="bm25-bar-track mt-2">
          <div className={cn("bm25-bar-fill", missed ? "is-miss" : undefined)} style={{ width: `${width}%` }} />
        </div>
        <p className="mt-1.5 font-mono text-[11px] tabular-nums text-fg-muted">
          <span className="text-fg">IDF {fmt(c.idf)}</span>
          <span className="mx-1.5 text-fg-subtle">×</span>
          <span className="text-fg">
            {locale === "en" ? "tf-sat" : "饱和"} {fmt(c.tfNorm)}
          </span>
          <span className="mx-1.5 text-border-strong">·</span>
          tf {c.tf}
          <span className="mx-1.5 text-border-strong">·</span>
          df {c.df}
        </p>
      </button>
    </li>
  );
}

function HandCalc({
  term,
  nDocs,
  dl,
  avgdl,
  k1,
  b,
  locale,
}: {
  term: TermContribution;
  nDocs: number;
  dl: number;
  avgdl: number;
  k1: number;
  b: number;
  locale: Locale;
}) {
  const idf = idfBreakdown(nDocs, term.df);
  const sat = saturationBreakdown(term.tf, dl, avgdl, k1, b);
  const lengthFactor = 1 - b + b * sat.lengthRatio;

  if (term.tf === 0) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-surface-2/60 px-4 py-3">
        <p className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? `Hand calc · "${term.term}"` : `手算 · 「${term.term}」`}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? `tf = 0, so the saturation term is 0. IDF ${fmt(idf.lucene)} is unused. Contribution = 0 — OR scoring, not a Boolean reject.`
            : `tf = 0，饱和项为 0。IDF ${fmt(idf.lucene)} 用不上。贡献 = 0——这是 OR 打分，不是整篇被否决。`}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface-2/60 px-4 py-4">
      <p className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? `Hand calc · "${term.term}"` : `手算 · 「${term.term}」`}
      </p>
      <p className="mt-1 font-mono text-[11px] tabular-nums text-fg-muted">
        N = {nDocs} · df = {term.df} · tf = {term.tf} · k1 = {k1.toFixed(1)} · b = {b.toFixed(2)}
      </p>
      <ol className="mt-3 space-y-3 font-mono text-xs leading-relaxed">
        <li>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "1 · IDF" : "1 · IDF 稀缺度"}
          </p>
          <p className="mt-0.5 text-fg-muted">
            ln(1 + ({nDocs} − {term.df} + 0.5) / ({term.df} + 0.5))
          </p>
          <p className="font-semibold text-accent tabular-nums">
            = ln(1 + {fmt(idf.num, 1)} / {fmt(idf.den, 1)}) = {fmt(idf.lucene)}
          </p>
          <p className="mt-1 font-sans text-[11px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? `Robertson original ln(${fmt(idf.num, 1)}/${fmt(idf.den, 1)}) = ${fmt(idf.robertson)}${idf.robertson < 0 ? " (negative)" : ""}. Lucene adds +1 so IDF stays non-negative.`
              : `Robertson 原版 ln(${fmt(idf.num, 1)}/${fmt(idf.den, 1)}) = ${fmt(idf.robertson)}${idf.robertson < 0 ? "（已为负数）" : ""}。Lucene 加了 1，恒正。`}
          </p>
        </li>
        <li className="border-t border-border/70 pt-3">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "2 · Length factor K" : "2 · 篇幅因子 K"}
          </p>
          <p className="mt-0.5 text-fg-muted">
            {k1.toFixed(1)} × (1 − {b.toFixed(2)} + {b.toFixed(2)} × {dl}/{fmt(avgdl, 1)})
          </p>
          <p className="font-semibold text-accent tabular-nums">
            = {k1.toFixed(1)} × {fmt(lengthFactor)} = {fmt(sat.K)}
          </p>
        </li>
        <li className="border-t border-border/70 pt-3">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "3 · TF saturation" : "3 · 词频饱和 TF_norm"}
          </p>
          <p className="mt-0.5 text-fg-muted">
            {term.tf} × ({k1.toFixed(1)}+1) / ({term.tf} + {fmt(sat.K)})
          </p>
          <p className="font-semibold text-accent tabular-nums">
            = {fmt(term.tf * (k1 + 1))} / {fmt(sat.denom)} = {fmt(sat.tfSat)}
          </p>
        </li>
        <li className="border-t border-border/70 pt-3">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "4 · Contribution" : "4 · 单项贡献"}
          </p>
          <p className="mt-0.5 text-base font-semibold text-bm25 tabular-nums">
            {fmt(idf.lucene)} × {fmt(sat.tfSat)} = {fmt(term.contribution)}
          </p>
        </li>
      </ol>
    </div>
  );
}

function pct(part: number, total: number): string {
  if (total <= 1e-12 || part <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
