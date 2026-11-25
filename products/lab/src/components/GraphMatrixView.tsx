import { ArrowUpRight } from "lucide-react";
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
    return <p className="text-[0.9375rem] text-fg-subtle">{copy.graphEmpty}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
          {copy.graphContrast}
        </h2>
        <span className="text-[0.8125rem] tabular-nums text-fg-subtle">
          {copy.graphPairs(pairs.length)}
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {pairs.map((pair) => {
          const a = studies.find((s) => s.slug === pair.a);
          const b = studies.find((s) => s.slug === pair.b);
          if (!a || !b) return null;
          const when = linkWhen(pair.when, pair.whenEn, locale);

          return (
            <article
              key={`${pair.a}|${pair.b}`}
              className="flex flex-col justify-between border-t border-border pt-4"
            >
              {when ? (
                <p className="mb-4 text-[0.9375rem] font-semibold leading-snug text-fg">{when}</p>
              ) : null}

              <div className="mt-auto grid grid-cols-2 divide-x divide-border border-t border-border/70 pt-3">
                {[a, b].map((node, idx) => (
                  <div
                    key={node.slug}
                    className={
                      idx === 0
                        ? "group relative flex flex-col justify-between pr-3.5"
                        : "group relative flex flex-col justify-between pl-3.5"
                    }
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectSlug(node.slug)}
                        className="block cursor-pointer text-left text-[0.9375rem] font-semibold leading-snug text-fg transition-colors duration-150 group-hover:text-accent after:absolute after:inset-0 after:content-['']"
                      >
                        {studyTitle(node, locale)}
                      </button>
                      {node.asks ? (
                        <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-fg-muted">
                          {studyAsks(node, locale)}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={`/s/${node.slug}`}
                      className="relative z-10 mt-3 inline-flex w-fit items-center gap-1 text-[0.8125rem] font-medium text-accent no-underline hover:underline"
                    >
                      <span>{copy.inspectorOpenStudy}</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
