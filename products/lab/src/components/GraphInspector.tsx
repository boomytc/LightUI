import { ArrowRight, ArrowUpRight, ChevronRight, Compass, GitCommit, X } from "lucide-react";
import { Link } from "./Link";
import { getStudyCategory } from "../lib/categories";
import { lineageOf, neighborsOf } from "../lib/graph";
import { messages } from "../lib/i18n";
import { linkWhen, studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function GraphInspector({
  slug,
  studies,
  locale,
  onClose,
  onSelectSlug,
}: {
  slug: string | undefined;
  studies: StudyMeta[];
  locale: Locale;
  onClose: () => void;
  onSelectSlug: (slug: string) => void;
}) {
  const copy = messages(locale);
  if (!slug) return null;

  const current = studies.find((s) => s.slug === slug);
  if (!current) return null;

  const category = getStudyCategory(slug);
  const asks = studyAsks(current, locale);
  const lineage = lineageOf(slug, studies);
  const neighbors = neighborsOf(slug, studies);

  const beforeNeighbors = neighbors.filter((n) => n.rel === "before");
  const afterNeighbors = neighbors.filter((n) => n.rel === "after");
  const contrastNeighbors = neighbors.filter((n) => n.rel === "contrast");

  return (
    <aside className="sticky top-20 flex max-h-[calc(100vh-6rem)] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl transition-all duration-200 lg:w-96">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-accent/15 text-accent">
            <Compass className="size-3.5" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
            {copy.inspectorTitle}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
          aria-label={copy.inspectorClose}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* Title & Metadata */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-subtle">
              {category}
            </span>
            <span className="font-mono text-[11px] text-fg-subtle">/s/{current.slug}</span>
          </div>
          <h2 className="mt-2 text-[1.3rem] font-bold tracking-tight text-fg">
            {studyTitle(current, locale)}
          </h2>
          {asks ? (
            <div className="mt-3 rounded-xl border border-border/80 bg-bg p-3 text-[13px] leading-relaxed text-fg-muted">
              <span className="font-semibold text-fg">{copy.graphAsks}{locale === "en" ? ":" : "："} </span>
              <span>{asks}</span>
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/s/${current.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-fg px-3 py-2 text-[12px] font-semibold text-surface shadow-xs transition-opacity hover:opacity-90 no-underline"
          >
            {copy.inspectorOpenStudy}
            <ArrowRight className="size-3.5" />
          </Link>
          <a
            href={`/s/${current.slug}/stage`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] font-medium text-fg shadow-xs transition-colors hover:bg-surface-2 no-underline"
          >
            {copy.inspectorStage}
            <ArrowUpRight className="size-3.5 text-fg-subtle" />
          </a>
        </div>

        {/* Lineage Overview Breadcrumb */}
        {lineage.ancestors.size > 0 || lineage.descendants.size > 0 ? (
          <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
              <GitCommit className="size-3.5 text-accent" />
              <span>{copy.inspectorLineage}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-[12px]">
              {Array.from(lineage.ancestors).map((ancSlug) => {
                const anc = studies.find((s) => s.slug === ancSlug);
                if (!anc) return null;
                return (
                  <span key={ancSlug} className="contents">
                    <button
                      type="button"
                      onClick={() => onSelectSlug(ancSlug)}
                      className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      {studyTitle(anc, locale)}
                    </button>
                    <ChevronRight className="size-3 text-fg-subtle opacity-60" />
                  </span>
                );
              })}
              <span className="rounded-md bg-accent px-2 py-0.5 font-semibold text-white">
                {studyTitle(current, locale)}
              </span>
              {Array.from(lineage.descendants).map((descSlug) => {
                const desc = studies.find((s) => s.slug === descSlug);
                if (!desc) return null;
                return (
                  <span key={descSlug} className="contents">
                    <ChevronRight className="size-3 text-fg-subtle opacity-60" />
                    <button
                      type="button"
                      onClick={() => onSelectSlug(descSlug)}
                      className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      {studyTitle(desc, locale)}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Before Decisions */}
        {beforeNeighbors.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-fg-subtle uppercase tracking-wider">
              {copy.relatedBefore}
            </p>
            <div className="space-y-1.5">
              {beforeNeighbors.map((item) => {
                const target = studies.find((s) => s.slug === item.slug);
                if (!target) return null;
                const when = linkWhen(item.when, item.whenEn, locale);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => onSelectSlug(item.slug)}
                    className="group flex w-full flex-col rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-border-strong hover:bg-surface-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-fg group-hover:text-accent transition-colors">
                        {studyTitle(target, locale)}
                      </span>
                      <ArrowRight className="size-3 text-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {when ? <p className="mt-1 text-[11px] text-fg-muted">{when}</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* After Decisions */}
        {afterNeighbors.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-accent uppercase tracking-wider">
              {copy.relatedAfter}
            </p>
            <div className="space-y-1.5">
              {afterNeighbors.map((item) => {
                const target = studies.find((s) => s.slug === item.slug);
                if (!target) return null;
                const when = linkWhen(item.when, item.whenEn, locale);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => onSelectSlug(item.slug)}
                    className="group flex w-full flex-col rounded-xl border border-accent/30 bg-accent/5 p-3 text-left transition-all hover:border-accent hover:bg-accent/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-fg group-hover:text-accent transition-colors">
                        {studyTitle(target, locale)}
                      </span>
                      <ArrowRight className="size-3 text-accent" />
                    </div>
                    {when ? <p className="mt-1 text-[11px] text-fg-muted">{when}</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Contrast Anti-patterns */}
        {contrastNeighbors.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-rose-500 uppercase tracking-wider">
              {copy.relatedContrast}
            </p>
            <div className="space-y-1.5">
              {contrastNeighbors.map((item) => {
                const target = studies.find((s) => s.slug === item.slug);
                if (!target) return null;
                const when = linkWhen(item.when, item.whenEn, locale);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => onSelectSlug(item.slug)}
                    className="group flex w-full flex-col rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-left transition-all hover:border-rose-500/40 hover:bg-rose-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-fg group-hover:text-rose-500 transition-colors">
                        ≠ {studyTitle(target, locale)}
                      </span>
                      <ArrowRight className="size-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {when ? <p className="mt-1 text-[11px] text-fg-muted">{when}</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
