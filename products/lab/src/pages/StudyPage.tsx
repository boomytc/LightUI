import { useEffect, useRef, useState, type ComponentType } from "react";
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { DeviceFrame } from "../components/DeviceFrame";
import { Page } from "../components/Page";
import { RelatedDecisions } from "../components/RelatedDecisions";
import { StudyPagination } from "../components/StudyPagination";
import { CodeBlock, Markdown } from "../lib/Markdown";
import { loadStudy } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyTitle } from "../lib/localize";
import { usePrefs } from "../lib/prefs";

const TABS = ["play", "stage", "code", "idea"] as const;
type StudyTab = (typeof TABS)[number];

const GESTURE_STUDIES = new Set([
  "pull-refresh",
  "touch-context",
  "press-select",
  "slide-confirm",
  "sheet-snap",
  "wheel-picker",
  "swipe-action",
  "sling-throw",
]);

export function StudyPage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const study = loadStudy(slug);
  const [tab, setTab] = useState<StudyTab>("play");
  const [activeCodeFile, setActiveCodeFile] = useState<"stage" | "machines">("stage");
  const isGestureStudy = GESTURE_STUDIES.has(slug);
  const [useDeviceFrame, setUseDeviceFrame] = useState(isGestureStudy);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<StudyTab, HTMLButtonElement | null>>>({});
  const skipFocus = useRef(true);

  const [studyViewState, setStudyViewState] = useState<{
    slug: string;
    Component: ComponentType | undefined;
    loaded: boolean;
  }>(() => ({
    slug,
    Component: study?.getCachedStudyView(),
    loaded: !study?.hasStudyView || Boolean(study?.getCachedStudyView()),
  }));

  const [stageViewState, setStageViewState] = useState<{
    slug: string;
    Component: ComponentType | undefined;
    loaded: boolean;
  }>(() => ({
    slug,
    Component: study?.getCachedStageView(),
    loaded: !study?.hasStageView || Boolean(study?.getCachedStageView()),
  }));

  const [codeState, setCodeState] = useState<{
    slug: string;
    stageCode: string;
    machinesCode: string | undefined;
    loaded: boolean;
  }>(() => ({
    slug,
    stageCode: study?.getCachedStageCode() ?? "",
    machinesCode: study?.getCachedMachinesCode(),
    loaded:
      study?.getCachedStageCode() !== undefined &&
      (!study?.hasMachinesCode || study?.getCachedMachinesCode() !== undefined),
  }));

  const [ideaState, setIdeaState] = useState<{
    key: string;
    source: string;
    loaded: boolean;
  }>(() => {
    const cached = study?.getCachedIdea(locale);
    return {
      key: `${slug}:${locale}`,
      source: cached ?? "",
      loaded: cached !== undefined,
    };
  });

  useEffect(() => {
    setTab("play");
    setActiveCodeFile("stage");
    setUseDeviceFrame(GESTURE_STUDIES.has(slug));
    skipFocus.current = true;
  }, [slug]);

  useEffect(() => {
    if (!study || tab !== "play") return;
    if (!study.hasStudyView) {
      setStudyViewState({ slug, Component: undefined, loaded: true });
      return;
    }
    const cached = study.getCachedStudyView();
    if (cached) {
      setStudyViewState({ slug, Component: cached, loaded: true });
      return;
    }
    let cancelled = false;
    setStudyViewState({ slug, Component: undefined, loaded: false });
    study
      .loadStudyView()
      .then((Component) => {
        if (!cancelled) setStudyViewState({ slug, Component, loaded: true });
      })
      .catch(() => {
        if (!cancelled) setStudyViewState({ slug, Component: undefined, loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, study, tab]);

  useEffect(() => {
    if (!study || tab !== "stage") return;
    if (!study.hasStageView) {
      setStageViewState({ slug, Component: undefined, loaded: true });
      return;
    }
    const cached = study.getCachedStageView();
    if (cached) {
      setStageViewState({ slug, Component: cached, loaded: true });
      return;
    }
    let cancelled = false;
    setStageViewState({ slug, Component: undefined, loaded: false });
    study
      .loadStageView()
      .then((Component) => {
        if (!cancelled) setStageViewState({ slug, Component, loaded: true });
      })
      .catch(() => {
        if (!cancelled) setStageViewState({ slug, Component: undefined, loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, study, tab]);

  useEffect(() => {
    if (!study || tab !== "code") return;
    const cachedStage = study.getCachedStageCode();
    const cachedMachines = study.getCachedMachinesCode();
    if (cachedStage !== undefined && (!study.hasMachinesCode || cachedMachines !== undefined)) {
      setCodeState({
        slug,
        stageCode: cachedStage,
        machinesCode: cachedMachines,
        loaded: true,
      });
      return;
    }
    let cancelled = false;
    setCodeState({ slug, stageCode: "", machinesCode: undefined, loaded: false });
    Promise.all([study.loadStageCode(), study.loadMachinesCode()])
      .then(([stageCode, machinesCode]) => {
        if (!cancelled) setCodeState({ slug, stageCode, machinesCode, loaded: true });
      })
      .catch(() => {
        if (!cancelled) setCodeState({ slug, stageCode: "", machinesCode: undefined, loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, study, tab]);

  useEffect(() => {
    if (!study || tab !== "idea") return;
    const key = `${slug}:${locale}`;
    const cached = study.getCachedIdea(locale);
    if (cached !== undefined) {
      setIdeaState({ key, source: cached, loaded: true });
      return;
    }
    let cancelled = false;
    setIdeaState({ key, source: "", loaded: false });
    study
      .loadIdea(locale)
      .then((source) => {
        if (!cancelled) setIdeaState({ key, source, loaded: true });
      })
      .catch(() => {
        if (!cancelled) setIdeaState({ key, source: "", loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, study, tab, locale]);

  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    const chrome = document.getElementById("study-chrome");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (chrome) {
      const header = window.matchMedia("(min-width: 640px)").matches ? 56 : 48;
      const top = window.scrollY + chrome.getBoundingClientRect().top - header;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "instant" : "smooth" });
    }
    panelRef.current?.focus({ preventScroll: true });
  }, [tab]);

  if (!study) {
    return (
      <Page as="main" className="py-16">
        <p className="text-[15px] text-fg-muted">{copy.missingStudy(slug)}</p>
        <BackLink fallback="/studies" />
      </Page>
    );
  }

  const { meta } = study;
  const StudyView = studyViewState.slug === slug ? studyViewState.Component : study.getCachedStudyView();
  const studyViewLoaded = studyViewState.slug === slug ? studyViewState.loaded : Boolean(StudyView);
  const StageView = stageViewState.slug === slug ? stageViewState.Component : study.getCachedStageView();
  const stageViewLoaded = stageViewState.slug === slug ? stageViewState.loaded : Boolean(StageView);
  const stageCode = codeState.slug === slug ? codeState.stageCode : (study.getCachedStageCode() ?? "");
  const machinesCode = codeState.slug === slug ? codeState.machinesCode : study.getCachedMachinesCode();
  const codeLoaded =
    codeState.slug === slug
      ? codeState.loaded
      : study.getCachedStageCode() !== undefined &&
        (!study.hasMachinesCode || study.getCachedMachinesCode() !== undefined);
  const ideaKey = `${slug}:${locale}`;
  const ideaSource = ideaState.key === ideaKey ? ideaState.source : (study.getCachedIdea(locale) ?? "");
  const ideaLoaded = ideaState.key === ideaKey ? ideaState.loaded : study.getCachedIdea(locale) !== undefined;
  const title = studyTitle(meta, locale);
  const currentCode = activeCodeFile === "machines" && machinesCode ? machinesCode : stageCode;
  const currentFilename = activeCodeFile === "machines" ? "machines.ts" : "StageView.tsx";

  function activate(next: StudyTab, via: "pointer" | "keyboard") {
    if (via === "keyboard") {
      skipFocus.current = true;
      setTab(next);
      requestAnimationFrame(() => tabRefs.current[next]?.focus());
      return;
    }
    setTab(next);
  }

  function onTabListKeyDown(e: React.KeyboardEvent) {
    const index = TABS.indexOf(tab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      activate(TABS[(index + 1) % TABS.length], "keyboard");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activate(TABS[(index - 1 + TABS.length) % TABS.length], "keyboard");
    } else if (e.key === "Home") {
      e.preventDefault();
      activate("play", "keyboard");
    } else if (e.key === "End") {
      e.preventDefault();
      activate("idea", "keyboard");
    }
  }

  return (
    <main id="lab-main">
      <div id="study-chrome" className="study-chrome border-b border-border/70 bg-surface/85 backdrop-blur-md">
        <div className="page-width flex h-11 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <BackLink
              fallback="/studies"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-[13px] text-fg-muted no-underline transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            />
            <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden="true" />
            <p className="truncate text-[13px] font-medium text-fg-muted">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            {isGestureStudy && tab === "stage" ? (
              <button
                type="button"
                onClick={() => setUseDeviceFrame(!useDeviceFrame)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg shadow-xs"
                title={useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
                aria-label={useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
              >
                {useDeviceFrame ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                <span>
                  {useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
                </span>
              </button>
            ) : null}

            <div
              className="flex shrink-0 rounded-lg border border-border bg-surface-2/70 p-0.5"
              role="tablist"
              aria-label={copy.studyViewTabs}
              onKeyDown={onTabListKeyDown}
            >
              {TABS.map((id) => (
                <TabButton
                  key={id}
                  id={`study-tab-${id}`}
                  controls={`study-panel-${id}`}
                  active={tab === id}
                  ref={(el) => {
                    tabRefs.current[id] = el;
                  }}
                  onClick={() => activate(id, "pointer")}
                >
                  {id === "play" ? copy.tabPlay : id === "stage" ? copy.tabStage : id === "code" ? copy.tabCode : copy.tabIdea}
                </TabButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        id={`study-panel-${tab}`}
        ref={panelRef}
        role="tabpanel"
        tabIndex={-1}
        aria-labelledby={`study-tab-${tab}`}
        className="study-panel min-w-0"
      >
        {tab === "play" ? (
          !studyViewLoaded ? (
            <TabLoading />
          ) : StudyView ? (
            <div className="study-play">{<StudyView />}</div>
          ) : (
            <p className="page-width py-12 text-[14px] text-fg-muted">{copy.noStudyView}</p>
          )
        ) : tab === "stage" ? (
          !stageViewLoaded ? (
            <TabLoading />
          ) : StageView ? (
            <div className="page-width py-10">
              <div className="mx-auto flex max-w-4xl flex-col items-center">
                <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold text-fg">{copy.stageHeading}</h2>
                    <p className="mt-0.5 text-[13px] text-fg-muted">{copy.stageDesc}</p>
                  </div>
                  <a
                    href={`/s/${meta.slug}/stage`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-fg no-underline shadow-xs transition-colors duration-150 hover:bg-surface-2"
                  >
                    {copy.openStandaloneStage}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
                {useDeviceFrame && isGestureStudy ? (
                  <DeviceFrame>
                    <StageView />
                  </DeviceFrame>
                ) : (
                  <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-10">
                    <StageView />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="page-width py-12 text-[14px] text-fg-muted">{copy.noStageView}</p>
          )
        ) : tab === "code" ? (
          <div className="page-width py-10">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-fg">{copy.codeHeading}</h2>
                  <p className="mt-0.5 text-[13px] text-fg-muted">{copy.codeDesc}</p>
                </div>
                {study.hasMachinesCode ? (
                  <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-[12px]">
                    <button
                      type="button"
                      onClick={() => setActiveCodeFile("stage")}
                      className={
                        activeCodeFile === "stage"
                          ? "rounded-md bg-surface px-2.5 py-1 font-medium text-fg shadow-xs"
                          : "rounded-md px-2.5 py-1 font-medium text-fg-muted hover:text-fg"
                      }
                    >
                      {copy.codeFileStage}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeFile("machines")}
                      className={
                        activeCodeFile === "machines"
                          ? "rounded-md bg-surface px-2.5 py-1 font-medium text-fg shadow-xs"
                          : "rounded-md px-2.5 py-1 font-medium text-fg-muted hover:text-fg"
                      }
                    >
                      {copy.codeFileMachines}
                    </button>
                  </div>
                ) : null}
              </div>
              {!codeLoaded ? (
                <TabLoading compact />
              ) : (
                <CodeBlock
                  code={currentCode}
                  filename={currentFilename}
                  copyLabel={copy.copyCode}
                  copiedLabel={copy.copiedCode}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="page-width py-12">
            {!ideaLoaded ? (
              <TabLoading compact />
            ) : (
              <article className="note-prose mx-auto max-w-4xl">
                <Markdown source={ideaSource} />
              </article>
            )}
          </div>
        )}
      </div>

      <div className="page-width pb-16">
        <RelatedDecisions slug={slug} locale={locale} />
        <StudyPagination slug={slug} locale={locale} />
      </div>
    </main>
  );
}

function TabLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={compact ? "flex min-h-48 items-center justify-center" : "page-width flex min-h-72 items-center justify-center"}
      aria-busy="true"
    >
      <div className="size-7 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}

function TabButton({
  id,
  controls,
  active,
  onClick,
  children,
  ref,
}: {
  id: string;
  controls: string;
  active: boolean;
  onClick: () => void;
  children: string;
  ref?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      id={id}
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-surface px-3 py-1 text-[12px] font-semibold text-fg shadow-xs"
          : "rounded-md px-3 py-1 text-[12px] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
      }
    >
      {children}
    </button>
  );
}
