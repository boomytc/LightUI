import { useLocale } from "../lib/site-locale.ts";
import { useLabStore } from "../lib/store.ts";
import type { LabDocument, RankedHit } from "../lib/bm25/types.ts";
import { cn } from "../lib/utils.ts";

export function HitList({
  hits,
  docs,
  tone,
  scoreLabel,
  rest = 0,
}: {
  hits: RankedHit[];
  docs: LabDocument[];
  tone: "bm25" | "vector" | "accent";
  scoreLabel: (h: RankedHit) => string;
  rest?: number;
}) {
  const locale = useLocale();
  const selected = useLabStore((s) => s.selectedDocId);
  const setSelected = useLabStore((s) => s.setSelectedDocId);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const max = Math.max(...hits.map((h) => h.score), 1e-9);
  const bar =
    tone === "bm25" ? "is-bm25" : tone === "vector" ? "is-vector" : "is-accent";
  const badgeTone =
    tone === "bm25"
      ? "bg-bm25/15 text-bm25 border-bm25/30"
      : tone === "vector"
        ? "bg-vector/15 text-vector border-vector/30"
        : "bg-accent-soft text-accent border-accent/30";
  const scoreTone = tone === "bm25" ? "text-bm25" : tone === "vector" ? "text-vector" : "text-accent";

  if (hits.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface-2/50 px-4 py-5 text-sm text-fg-muted">
        {locale === "en" ? "No documents matched the query terms." : "没有一篇命中查询词。"}
      </p>
    );
  }

  return (
    <div>
      <ol className="m-0 list-none space-y-2 p-0">
        {hits.map((h) => {
          const doc = byId.get(h.docId);
          const active = selected === h.docId;
          return (
            <li key={h.docId}>
              <button
                type="button"
                onClick={() => setSelected(h.docId)}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
                  active
                    ? "border-border-strong bg-surface shadow-card"
                    : "border-border bg-surface-2/40 hover:bg-surface",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tabular-nums text-fg-subtle">#{h.rank}</p>
                    <p className="mt-0.5 truncate text-[13px] font-semibold text-fg">
                      {doc?.title ?? h.docId}
                    </p>
                  </div>
                  <p className={cn("font-mono text-lg font-semibold tabular-nums tracking-tight", scoreTone)}>
                    {scoreLabel(h)}
                  </p>
                </div>
                <div className="bm25-bar-track mt-2.5">
                  <div
                    className={cn("bm25-bar-fill", bar)}
                    style={{ width: `${Math.max(4, (h.score / max) * 100)}%` }}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {h.matchedTerms.map((t) => (
                    <span
                      key={`m-${t}`}
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium",
                        badgeTone,
                      )}
                    >
                      {t}
                    </span>
                  ))}
                  {h.missingTerms.map((t) => (
                    <span
                      key={`x-${t}`}
                      className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-subtle line-through opacity-60"
                    >
                      {t}
                    </span>
                  ))}
                  {h.bm25Rank != null || h.vectorRank != null ? (
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted">
                      {h.bm25Rank ? `B#${h.bm25Rank}` : "B–"} · {h.vectorRank ? `V#${h.vectorRank}` : "V–"}
                    </span>
                  ) : null}
                </div>
                {doc?.note ? (
                  <p className="mt-1.5 text-[12px] leading-relaxed text-fg-muted">
                    {locale === "en" ? doc.noteEn ?? doc.note : doc.note}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      {rest > 0 ? (
        <p className="mt-2.5 px-1 font-mono text-[11px] text-fg-subtle">
          {tone === "vector"
            ? locale === "en"
              ? `Other ${rest} docs unlisted (lower similarity)`
              : `其余 ${rest} 篇未展示（低相关度）`
            : locale === "en"
              ? `Other ${rest} docs have a score of 0`
              : `其余 ${rest} 篇分数为 0`}
        </p>
      ) : null}
    </div>
  );
}
