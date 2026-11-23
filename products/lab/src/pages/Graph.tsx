import { useCallback, useEffect, useMemo, useState } from "react";
import { GitFork, Layers, Scale } from "lucide-react";
import { GraphCanvas } from "../components/GraphCanvas";
import { GraphClusterView } from "../components/GraphClusterView";
import { GraphInspector } from "../components/GraphInspector";
import { GraphMatrixView } from "../components/GraphMatrixView";
import { Page } from "../components/Page";
import { PageHero } from "../components/PageHero";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { replaceHash, useHash } from "../lib/nav";
import { usePrefs } from "../lib/prefs";

type ViewMode = "flow" | "cluster" | "matrix";

export function Graph() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const focusHash = useHash();
  const [viewMode, setViewMode] = useState<ViewMode>("flow");

  const studies = useMemo(
    () =>
      loadStudies()
        .map((s) => s.meta)
        .filter((meta) => meta.status !== "retired"),
    [],
  );

  const studySlugs = useMemo(() => new Set(studies.map((s) => s.slug)), [studies]);

  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(() =>
    focusHash && studySlugs.has(focusHash) ? focusHash : undefined,
  );

  useEffect(() => {
    if (!focusHash) {
      setSelectedSlug(undefined);
      return;
    }
    if (studySlugs.has(focusHash)) {
      setSelectedSlug(focusHash);
    }
  }, [focusHash, studySlugs]);

  const selectSlug = useCallback((next: string | undefined) => {
    setSelectedSlug(next);
    replaceHash(next ?? null);
  }, []);

  const toggleSlug = useCallback(
    (slug: string) => {
      const next = selectedSlug === slug ? undefined : slug;
      selectSlug(next);
    },
    [selectedSlug, selectSlug],
  );

  const modes: { id: ViewMode; icon: typeof GitFork; label: string }[] = [
    { id: "flow", icon: GitFork, label: copy.viewModeFlow },
    { id: "cluster", icon: Layers, label: copy.viewModeCluster },
    { id: "matrix", icon: Scale, label: copy.viewModeMatrix },
  ];

  return (
    <Page as="main" className="pb-24 pt-10 sm:pt-12">
      <PageHero title={copy.graphPageTitle} lede={copy.graphPageLede}>
        <div className="flex w-full items-center rounded-xl border border-border bg-surface-2/80 p-1 shadow-xs sm:w-auto">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const active = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                aria-pressed={active}
                className={
                  active
                    ? "flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs sm:flex-none"
                    : "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted transition-colors duration-150 hover:text-fg sm:flex-none"
                }
              >
                <Icon
                  className={
                    mode.id === "flow"
                      ? "size-3.5 text-accent"
                      : mode.id === "cluster"
                        ? "size-3.5 text-intent"
                        : "size-3.5 text-wrong"
                  }
                />
                <span className="whitespace-nowrap">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </PageHero>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {viewMode === "flow" ? (
            <GraphCanvas
              studies={studies}
              locale={locale}
              selectedSlug={selectedSlug}
              onSelectSlug={toggleSlug}
            />
          ) : viewMode === "cluster" ? (
            <GraphClusterView
              studies={studies}
              locale={locale}
              selectedSlug={selectedSlug}
              onSelectSlug={toggleSlug}
            />
          ) : (
            <GraphMatrixView
              studies={studies}
              locale={locale}
              onSelectSlug={(slug) => selectSlug(slug)}
            />
          )}
        </div>

        {selectedSlug ? (
          <GraphInspector
            slug={selectedSlug}
            studies={studies}
            locale={locale}
            onClose={() => selectSlug(undefined)}
            onSelectSlug={(slug) => selectSlug(slug)}
          />
        ) : null}
      </div>
    </Page>
  );
}
