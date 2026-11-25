import { ArrowRight } from "lucide-react";
import { Link } from "./Link";
import { CATEGORIES, getStudyCategory } from "../lib/categories";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function GraphClusterView({
  studies,
  locale,
  selectedSlug,
  onSelectSlug,
}: {
  studies: StudyMeta[];
  locale: Locale;
  selectedSlug?: string;
  onSelectSlug: (slug: string) => void;
}) {
  const copy = messages(locale);

  const domainGroups = CATEGORIES.filter((c) => c.id !== "all")
    .map((cat) => {
      const items = studies.filter((s) => getStudyCategory(s) === cat.id);
      return {
        id: cat.id,
        title: locale === "en" ? cat.nameEn : cat.nameZh,
        desc: locale === "en" ? cat.descEn : cat.descZh,
        items,
      };
    })
    .filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
      {domainGroups.map((group) => (
        <section key={group.id} className="flex min-w-0 flex-col border-t-2 border-fg pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
              {group.title}
            </h2>
            <span className="text-[0.8125rem] tabular-nums text-fg-subtle">
              {copy.domainStudiesCount(group.items.length)}
            </span>
          </div>

          {group.desc ? (
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">{group.desc}</p>
          ) : null}

          <ul className="mt-4 divide-y divide-border border-t border-border">
            {group.items.map((meta) => {
              const isSelected = selectedSlug === meta.slug;
              const asks = studyAsks(meta, locale);
              return (
                <li
                  key={meta.slug}
                  className={
                    isSelected
                      ? "group relative -mx-2 rounded-lg bg-accent-soft px-2 py-3 transition-colors duration-150"
                      : "group relative -mx-2 rounded-lg px-2 py-3 transition-colors duration-150 hover:bg-surface/70"
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="min-w-0 text-[0.9375rem] font-semibold leading-snug text-fg transition-colors duration-150 group-hover:text-accent">
                      <button
                        type="button"
                        onClick={() => onSelectSlug(meta.slug)}
                        aria-pressed={isSelected}
                        className="cursor-pointer text-left after:absolute after:inset-0 after:content-['']"
                      >
                        {studyTitle(meta, locale)}
                      </button>
                    </h3>
                    <Link
                      href={`/s/${meta.slug}`}
                      className="relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-fg-subtle no-underline transition-colors duration-150 hover:bg-surface hover:text-accent"
                      title={copy.inspectorOpenStudy}
                      aria-label={`${copy.inspectorOpenStudy}: ${studyTitle(meta, locale)}`}
                    >
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                  {asks ? (
                    <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                      {asks}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
