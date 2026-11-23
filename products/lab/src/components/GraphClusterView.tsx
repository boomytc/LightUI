import { ArrowRight, Compass, Layers, MousePointer, Sliders, Sparkles } from "lucide-react";
import { Link } from "./Link";
import { CATEGORIES, getStudyCategory } from "../lib/categories";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

const CATEGORY_ICONS: Record<string, typeof Sparkles> = {
  pointer: MousePointer,
  layout: Layers,
  controls: Sliders,
  feedback: Sparkles,
  craft: Compass,
};

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

  // Group studies by category id
  const domainGroups = CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
    const items = studies.filter((s) => getStudyCategory(s) === cat.id);
    return {
      id: cat.id,
      title: locale === "en" ? cat.nameEn : cat.nameZh,
      desc: locale === "en" ? cat.descEn : cat.descZh,
      icon: CATEGORY_ICONS[cat.id] ?? Sparkles,
      items,
    };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {domainGroups.map((group) => {
        const Icon = group.icon;
        return (
          <div
            key={group.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-200 hover:border-border-strong"
          >
            {/* Domain Island Header */}
            <div className="border-b border-border bg-surface-2/60 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-fg text-surface shadow-xs">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-fg">{group.title}</h3>
                    <span className="text-[11px] font-mono text-fg-subtle">{copy.domainStudiesCount(group.items.length)}</span>
                  </div>
                </div>
              </div>
              {group.desc ? (
                <p className="mt-2.5 text-[12px] leading-relaxed text-fg-muted">
                  {group.desc}
                </p>
              ) : null}
            </div>

            {/* Studies in this Domain */}
            <div className="flex-1 space-y-2 p-4">
              {group.items.map((meta) => {
                const isSelected = selectedSlug === meta.slug;
                const asks = studyAsks(meta, locale);
                return (
                  <div
                    key={meta.slug}
                    className={
                      isSelected
                        ? "group relative flex w-full flex-col rounded-xl border border-accent bg-accent/10 p-3.5 text-left shadow-xs transition-colors duration-200"
                        : "group relative flex w-full flex-col rounded-xl border border-border/70 bg-bg p-3.5 text-left transition-colors duration-200 hover:border-border-strong hover:bg-surface-2"
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="min-w-0 text-[13px] font-semibold text-fg transition-colors group-hover:text-accent">
                        <button
                          type="button"
                          onClick={() => onSelectSlug(meta.slug)}
                          aria-pressed={isSelected}
                          className="cursor-pointer text-left after:absolute after:inset-0 after:content-['']"
                        >
                          {studyTitle(meta, locale)}
                        </button>
                      </h4>
                      <Link
                        href={`/s/${meta.slug}`}
                        className="relative z-10 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-fg-subtle no-underline hover:bg-surface hover:text-fg"
                        title={copy.inspectorOpenStudy}
                        aria-label={`${copy.inspectorOpenStudy}: ${studyTitle(meta, locale)}`}
                      >
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                    {asks ? (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-fg-muted">
                        {asks}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
