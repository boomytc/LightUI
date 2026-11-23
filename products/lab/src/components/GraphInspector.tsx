import { useEffect } from "react";
import { ArrowRight, ArrowUpRight, ChevronRight, Compass, GitCommit, X } from "lucide-react";
import { Link } from "./Link";
import { categoryLabel, getStudyCategory } from "../lib/categories";
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

  useEffect(() => {
    if (!slug) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const syncBodyLock = () => {
      document.body.style.overflow = mq.matches ? "" : "hidden";
    };
    syncBodyLock();
    mq.addEventListener("change", syncBodyLock);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      mq.removeEventListener("change", syncBodyLock);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [slug, onClose]);

  if (!slug) return null;

  const current = studies.find((s) => s.slug === slug);
  if (!current) return null;

  const studyBySlug = new Map(studies.map((s) => [s.slug, s]));
  const category = getStudyCategory(current);
  const asks = studyAsks(current, locale);
  const lineage = lineageOf(slug, studies);
  const neighbors = neighborsOf(slug, studies);

  const beforeNeighbors = neighbors.filter((n) => n.rel === "before");
  const afterNeighbors = neighbors.filter((n) => n.rel === "after");
  const contrastNeighbors = neighbors.filter((n) => n.rel === "contrast");

  return (
    <>
      <div
        className="lab-overlay fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        aria-label={copy.inspectorTitle}
        className="lab-drawer fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-surface shadow-menu lg:sticky lg:inset-auto lg:top-20 lg:z-auto lg:max-h-[calc(100vh-6rem)] lg:w-96 lg:shrink-0 lg:rounded-2xl lg:border-b"
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center bg-surface-2/60 pt-2.5 lg:hidden" aria-hidden="true">
          <span className="h-1 w-9 rounded-full bg-border-strong" />
        </div>

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
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                {categoryLabel(category, locale)}
              </span>
              <span className="font-mono text-[11px] text-fg-subtle">/s/{current.slug}</span>
            </div>
            <h2 className="mt-2 text-[1.3rem] font-bold tracking-tight text-fg">
              {studyTitle(current, locale)}
            </h2>
            {asks ? (
              <div className="mt-3 rounded-xl border border-border/80 bg-bg p-3 text-[13px] leading-relaxed text-fg-muted">
                <span className="font-semibold text-fg">
                  {copy.graphAsks}
                  {locale === "en" ? ":" : "："}{" "}
                </span>
                <span>{asks}</span>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/s/${current.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-fg px-3 py-2 text-[12px] font-semibold text-surface no-underline shadow-xs transition-opacity hover:opacity-90"
            >
              {copy.inspectorOpenStudy}
              <ArrowRight className="size-3.5" />
            </Link>
            <a
              href={`/s/${current.slug}/stage`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] font-medium text-fg no-underline shadow-xs transition-colors hover:bg-surface-2"
            >
              {copy.inspectorStage}
              <ArrowUpRight className="size-3.5 text-fg-subtle" />
            </a>
          </div>

          {/* Lineage Overview Breadcrumb (root -> leaf by topological depth) */}
          {lineage.ancestorLayers.length > 0 || lineage.descendantLayers.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
                <GitCommit className="size-3.5 text-accent" />
                <span>{copy.inspectorLineage}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px]">
                {lineage.ancestorLayers.map((layer, layerIdx) => {
                  const items = layer
                    .map((s) => studyBySlug.get(s))
                    .filter((m): m is StudyMeta => Boolean(m));
                  if (items.length === 0) return null;
                  return (
                    <span key={`anc-${layerIdx}`} className="inline-flex flex-wrap items-center gap-1">
                      <span
                        className={
                          items.length > 1
                            ? "inline-flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-bg/60 p-0.5"
                            : "inline-flex items-center"
                        }
                      >
                        {items.map((anc) => (
                          <button
                            key={anc.slug}
                            type="button"
                            onClick={() => onSelectSlug(anc.slug)}
                            className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-fg-muted transition-colors hover:border-accent hover:text-accent"
                          >
                            {studyTitle(anc, locale)}
                          </button>
                        ))}
                      </span>
                      <ChevronRight className="size-3 text-fg-subtle opacity-60" />
                    </span>
                  );
                })}
                <span className="rounded-md bg-accent px-2 py-0.5 font-semibold text-accent-fg">
                  {studyTitle(current, locale)}
                </span>
                {lineage.descendantLayers.map((layer, layerIdx) => {
                  const items = layer
                    .map((s) => studyBySlug.get(s))
                    .filter((m): m is StudyMeta => Boolean(m));
                  if (items.length === 0) return null;
                  return (
                    <span key={`desc-${layerIdx}`} className="inline-flex flex-wrap items-center gap-1">
                      <ChevronRight className="size-3 text-fg-subtle opacity-60" />
                      <span
                        className={
                          items.length > 1
                            ? "inline-flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-bg/60 p-0.5"
                            : "inline-flex items-center"
                        }
                      >
                        {items.map((desc) => (
                          <button
                            key={desc.slug}
                            type="button"
                            onClick={() => onSelectSlug(desc.slug)}
                            className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-fg-muted transition-colors hover:border-accent hover:text-accent"
                          >
                            {studyTitle(desc, locale)}
                          </button>
                        ))}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Before Decisions */}
          {beforeNeighbors.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-fg-subtle">
                {copy.relatedBefore}
              </p>
              <div className="space-y-1.5">
                {beforeNeighbors.map((item) => {
                  const target = studyBySlug.get(item.slug);
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
                        <span className="text-[13px] font-semibold text-fg transition-colors group-hover:text-accent">
                          {studyTitle(target, locale)}
                        </span>
                        <ArrowRight className="size-3 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
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
              <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                {copy.relatedAfter}
              </p>
              <div className="space-y-1.5">
                {afterNeighbors.map((item) => {
                  const target = studyBySlug.get(item.slug);
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
                        <span className="text-[13px] font-semibold text-fg transition-colors group-hover:text-accent">
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
              <p className="text-[12px] font-semibold uppercase tracking-wider text-wrong">
                {copy.relatedContrast}
              </p>
              <div className="space-y-1.5">
                {contrastNeighbors.map((item) => {
                  const target = studyBySlug.get(item.slug);
                  if (!target) return null;
                  const when = linkWhen(item.when, item.whenEn, locale);
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onSelectSlug(item.slug)}
                      className="group flex w-full flex-col rounded-xl border border-wrong/20 bg-wrong-soft p-3 text-left transition-colors hover:border-wrong/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-fg transition-colors group-hover:text-wrong">
                          ≠ {studyTitle(target, locale)}
                        </span>
                        <ArrowRight className="size-3 text-wrong opacity-0 transition-opacity group-hover:opacity-100" />
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
    </>
  );
}
