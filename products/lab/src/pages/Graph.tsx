import { useEffect, useState } from "react";
import { GitFork, Layers, Scale } from "lucide-react";
import { GraphCanvas } from "../components/GraphCanvas";
import { GraphClusterView } from "../components/GraphClusterView";
import { GraphInspector } from "../components/GraphInspector";
import { GraphMatrixView } from "../components/GraphMatrixView";
import { Page } from "../components/Page";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { useHash } from "../lib/nav";
import { usePrefs } from "../lib/prefs";

type ViewMode = "flow" | "cluster" | "matrix";

export function Graph() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const focusHash = useHash();
  const [viewMode, setViewMode] = useState<ViewMode>("flow");
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(focusHash || undefined);

  const studies = loadStudies()
    .map((s) => s.meta)
    .filter((meta) => meta.status !== "retired");

  useEffect(() => {
    if (focusHash && studies.some((s) => s.slug === focusHash)) {
      setSelectedSlug(focusHash);
    }
  }, [focusHash, studies]);

  return (
    <Page as="main" className="pb-24 pt-10">
      {/* Header with Title and Perspective Tabs */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border/80 pb-6">
        <div>
          <h1 className="text-[1.8rem] font-bold tracking-tight sm:text-[2.2rem]">
            {copy.graphPageTitle}
          </h1>
          <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-fg-muted sm:text-[15px]">
            {copy.graphPageLede}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex shrink-0 items-center rounded-xl border border-border bg-surface-2 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("flow")}
            className={
              viewMode === "flow"
                ? "flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs"
                : "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:text-fg"
            }
          >
            <GitFork className="size-3.5 text-accent" />
            <span>{copy.viewModeFlow}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cluster")}
            className={
              viewMode === "cluster"
                ? "flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs"
                : "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:text-fg"
            }
          >
            <Layers className="size-3.5 text-emerald-500" />
            <span>{copy.viewModeCluster}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            className={
              viewMode === "matrix"
                ? "flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs"
                : "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:text-fg"
            }
          >
            <Scale className="size-3.5 text-rose-500" />
            <span>{copy.viewModeMatrix}</span>
          </button>
        </div>
      </header>

      {/* Main Perspective Body & Inspector Drawer */}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left/Main Graph View Area */}
        <div className="min-w-0 flex-1">
          {viewMode === "flow" ? (
            <GraphCanvas
              studies={studies}
              locale={locale}
              selectedSlug={selectedSlug}
              onSelectSlug={(slug) =>
                setSelectedSlug((prev) => (prev === slug ? undefined : slug))
              }
            />
          ) : viewMode === "cluster" ? (
            <GraphClusterView
              studies={studies}
              locale={locale}
              selectedSlug={selectedSlug}
              onSelectSlug={(slug) =>
                setSelectedSlug((prev) => (prev === slug ? undefined : slug))
              }
            />
          ) : (
            <GraphMatrixView
              studies={studies}
              locale={locale}
              onSelectSlug={(slug) => setSelectedSlug(slug)}
            />
          )}
        </div>

        {/* Right Decision Inspector Drawer (Desktop Sticky, Mobile Bottom) */}
        {selectedSlug ? (
          <GraphInspector
            slug={selectedSlug}
            studies={studies}
            locale={locale}
            onClose={() => setSelectedSlug(undefined)}
            onSelectSlug={(slug) => setSelectedSlug(slug)}
          />
        ) : null}
      </div>
    </Page>
  );
}
