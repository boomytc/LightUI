import { ArrowUpRight, Scale } from "lucide-react";
import { Link } from "./Link";
import { contrastPairs } from "../lib/graph";
import { messages } from "../lib/i18n";
import { linkWhen, studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function GraphMatrixView({
  studies,
  locale,
  onSelectSlug,
}: {
  studies: StudyMeta[];
  locale: Locale;
  onSelectSlug: (slug: string) => void;
}) {
  const copy = messages(locale);
  const pairs = contrastPairs(studies);

  if (pairs.length === 0) {
    return <p className="text-[14px] text-fg-subtle">{copy.graphEmpty}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-fg">
          <Scale className="size-4 text-rose-500" />
          <span>{copy.graphContrast} ({copy.graphPairs(pairs.length)})</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pairs.map((pair) => {
          const a = studies.find((s) => s.slug === pair.a);
          const b = studies.find((s) => s.slug === pair.b);
          if (!a || !b) return null;
          const when = linkWhen(pair.when, pair.whenEn, locale);

          return (
            <div
              key={`${pair.a}|${pair.b}`}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:border-border-strong"
            >
              {/* Header Context / When */}
              {when ? (
                <div className="mb-4">
                  <span className="inline-block rounded-md bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-rose-500">
                    {locale === "en" ? "Distinction" : "辨析"}
                  </span>
                  <p className="mt-1.5 text-[14px] font-medium leading-snug text-fg">
                    {when}
                  </p>
                </div>
              ) : null}

              {/* Binary Contrast Duel Cards */}
              <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2">
                {/* Node A */}
                <div
                  onClick={() => onSelectSlug(a.slug)}
                  className="flex cursor-pointer flex-col justify-between rounded-xl border border-border/80 bg-bg p-3 transition-colors hover:border-accent hover:bg-surface-2"
                >
                  <div>
                    <span className="block text-[13px] font-semibold text-fg leading-tight">
                      {studyTitle(a, locale)}
                    </span>
                    {a.asks ? (
                      <p className="mt-1 text-[11px] text-fg-muted line-clamp-2">
                        {studyAsks(a, locale)}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`/s/${a.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] text-accent no-underline hover:underline"
                  >
                    <span>{copy.tryWork}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>

                {/* Node B */}
                <div
                  onClick={() => onSelectSlug(b.slug)}
                  className="flex cursor-pointer flex-col justify-between rounded-xl border border-border/80 bg-bg p-3 transition-colors hover:border-accent hover:bg-surface-2"
                >
                  <div>
                    <span className="block text-[13px] font-semibold text-fg leading-tight">
                      {studyTitle(b, locale)}
                    </span>
                    {b.asks ? (
                      <p className="mt-1 text-[11px] text-fg-muted line-clamp-2">
                        {studyAsks(b, locale)}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`/s/${b.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] text-accent no-underline hover:underline"
                  >
                    <span>{copy.tryWork}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
