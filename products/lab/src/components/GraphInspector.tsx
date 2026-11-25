import { useEffect } from "react";
import { ArrowRight, ArrowUpRight, ChevronRight, X } from "lucide-react";
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
  const open = Boolean(slug);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

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
        className="lab-drawer fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border-strong bg-surface shadow-menu lg:sticky lg:inset-auto lg:top-20 lg:z-auto lg:max-h-[calc(100vh-6rem)] lg:w-[22rem] lg:shrink-0 lg:rounded-xl lg:border-b"
      >
        <div className="flex justify-center pt-2.5 lg:hidden" aria-hidden="true">
          <span className="h-1 w-9 rounded-full bg-border-strong" />
        </div>

        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <span className="text-[0.8125rem] font-semibold text-fg-subtle">
            {copy.inspectorTitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-fg-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            aria-label={copy.inspectorClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-5">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="min-w-0 text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
                {studyTitle(current, locale)}
              </h2>
              <span className="shrink-0 text-[0.8125rem] text-fg-subtle">
                {categoryLabel(category, locale)}
              </span>
            </div>
            {asks ? (
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-fg-muted">{asks}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/s/${current.slug}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-fg px-4 py-2 text-[0.8125rem] font-medium text-surface no-underline transition-opacity duration-150 hover:opacity-90"
            >
              <span>{copy.inspectorOpenStudy}</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <a
              href={`/s/${current.slug}/stage`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-accent"
            >
              <span>{copy.inspectorStage}</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          {lineage.ancestorLayers.length > 0 || lineage.descendantLayers.length > 0 ? (
            <div className="border-t border-border pt-4">
              <p className="text-[0.8125rem] font-semibold text-fg-subtle">
                {copy.inspectorLineage}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
                {lineage.ancestorLayers.map((layer, layerIdx) => {
                  const items = layer
                    .map((s) => studyBySlug.get(s))
                    .filter((m): m is StudyMeta => Boolean(m));
                  if (items.length === 0) return null;
                  return (
                    <span key={`anc-${layerIdx}`} className="inline-flex flex-wrap items-center gap-1">
                      {items.map((anc) => (
                        <button
                          key={anc.slug}
                          type="button"
                          onClick={() => onSelectSlug(anc.slug)}
                          className="rounded-md bg-surface-2 px-2 py-0.5 text-fg-muted transition-colors duration-150 hover:text-accent"
                        >
                          {studyTitle(anc, locale)}
                        </button>
                      ))}
                      <ChevronRight className="size-3 text-fg-subtle" />
                    </span>
                  );
                })}
                <span className="font-semibold text-accent">{studyTitle(current, locale)}</span>
                {lineage.descendantLayers.map((layer, layerIdx) => {
                  const items = layer
                    .map((s) => studyBySlug.get(s))
                    .filter((m): m is StudyMeta => Boolean(m));
                  if (items.length === 0) return null;
                  return (
                    <span key={`desc-${layerIdx}`} className="inline-flex flex-wrap items-center gap-1">
                      <ChevronRight className="size-3 text-fg-subtle" />
                      {items.map((desc) => (
                        <button
                          key={desc.slug}
                          type="button"
                          onClick={() => onSelectSlug(desc.slug)}
                          className="rounded-md bg-surface-2 px-2 py-0.5 text-fg-muted transition-colors duration-150 hover:text-accent"
                        >
                          {studyTitle(desc, locale)}
                        </button>
                      ))}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          {beforeNeighbors.length > 0 ? (
            <div className="border-t border-border pt-4">
              <p className="text-[0.8125rem] font-semibold text-fg-subtle">{copy.relatedBefore}</p>
              <div className="mt-2 divide-y divide-border">
                {beforeNeighbors.map((item) => {
                  const target = studyBySlug.get(item.slug);
                  if (!target) return null;
                  const when = linkWhen(item.when, item.whenEn, locale);
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onSelectSlug(item.slug)}
                      className="group flex w-full flex-col py-2.5 text-left transition-colors duration-150 hover:text-accent"
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="text-[0.9375rem] font-medium text-fg transition-colors duration-150 group-hover:text-accent">
                          {studyTitle(target, locale)}
                        </span>
                        <ArrowRight className="size-3.5 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent" />
                      </span>
                      {when ? (
                        <span className="mt-0.5 block text-[0.8125rem] text-fg-muted">{when}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {afterNeighbors.length > 0 ? (
            <div className="border-t border-border pt-4">
              <p className="text-[0.8125rem] font-semibold text-accent">{copy.relatedAfter}</p>
              <div className="mt-2 divide-y divide-border">
                {afterNeighbors.map((item) => {
                  const target = studyBySlug.get(item.slug);
                  if (!target) return null;
                  const when = linkWhen(item.when, item.whenEn, locale);
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onSelectSlug(item.slug)}
                      className="group flex w-full flex-col py-2.5 text-left transition-colors duration-150"
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="text-[0.9375rem] font-medium text-fg transition-colors duration-150 group-hover:text-accent">
                          {studyTitle(target, locale)}
                        </span>
                        <ArrowRight className="size-3.5 text-accent transition-transform duration-150 group-hover:translate-x-0.5" />
                      </span>
                      {when ? (
                        <span className="mt-0.5 block text-[0.8125rem] text-fg-muted">{when}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {contrastNeighbors.length > 0 ? (
            <div className="border-t border-border pt-4">
              <p className="text-[0.8125rem] font-semibold text-wrong">{copy.relatedContrast}</p>
              <div className="mt-2 divide-y divide-border">
                {contrastNeighbors.map((item) => {
                  const target = studyBySlug.get(item.slug);
                  if (!target) return null;
                  const when = linkWhen(item.when, item.whenEn, locale);
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onSelectSlug(item.slug)}
                      className="group flex w-full flex-col py-2.5 text-left transition-colors duration-150"
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="text-[0.9375rem] font-medium text-fg transition-colors duration-150 group-hover:text-wrong">
                          ≠ {studyTitle(target, locale)}
                        </span>
                        <ArrowRight className="size-3.5 text-wrong transition-transform duration-150 group-hover:translate-x-0.5" />
                      </span>
                      {when ? (
                        <span className="mt-0.5 block text-[0.8125rem] text-fg-muted">{when}</span>
                      ) : null}
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
