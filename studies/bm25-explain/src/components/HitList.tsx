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
  const bar = tone === "bm25" ? "bg-bm25" : tone === "vector" ? "bg-vector" : "bg-accent";
  const badgeTone =
    tone === "bm25"
      ? "bg-bm25/15 text-bm25 border-bm25/30"
      : tone === "vector"
        ? "bg-vector/15 text-vector border-vector/30"
        : "bg-accent/15 text-accent border-accent/30";

  if (hits.length === 0) {
    return (
      <p className="rounded-xl bg-surface px-4 py-5 text-sm text-fg-muted border border-border shadow-sm">
        {locale === "en" ? "No documents matched the query terms." : "没有一篇命中查询词。"}
      </p>
    );
  }

  return (
    <div>
      <ol className="space-y-2.5 list-none p-0 m-0">
        {hits.map((h) => {
          const doc = byId.get(h.docId);
          const active = selected === h.docId;
          return (
            <li key={h.docId}>
              <button
                type="button"
                onClick={() => setSelected(h.docId)}
                className={cn(
                  "w-full rounded-xl bg-surface p-3.5 text-left border border-border shadow-sm transition-all duration-150 cursor-pointer",
                  active
                    ? "border-accent ring-2 ring-accent/30 bg-accent/[0.02]"
                    : "hover:border-border-strong hover:bg-surface-2/60",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-sm text-fg">
                    <span className="mr-2 font-mono text-xs tabular-nums text-fg-subtle font-normal">
                      #{h.rank}
                    </span>
                    {doc?.title ?? h.docId}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-fg-muted font-medium">
                    {scoreLabel(h)}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", bar)}
                    style={{ width: `${Math.max(4, (h.score / max) * 100)}%` }}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {h.matchedTerms.map((t) => (
                    <span
                      key={`m-${t}`}
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-medium border",
                        badgeTone,
                      )}
                    >
                      {t}
                    </span>
                  ))}
                  {h.missingTerms.map((t) => (
                    <span
                      key={`x-${t}`}
                      className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-subtle line-through opacity-60 border border-border"
                    >
                      {t}
                    </span>
                  ))}
                  {h.bm25Rank != null || h.vectorRank != null ? (
                    <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted border border-border">
                      {h.bm25Rank ? `B#${h.bm25Rank}` : "B–"} · {h.vectorRank ? `V#${h.vectorRank}` : "V–"}
                    </span>
                  ) : null}
                </div>
                {doc?.note ? (
                  <p className="mt-1.5 text-xs text-fg-muted leading-relaxed">
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
