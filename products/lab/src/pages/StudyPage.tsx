import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { DeviceFrame } from "../components/DeviceFrame";
import { Page } from "../components/Page";
import { RelatedDecisions } from "../components/RelatedDecisions";
import { StudyPagination } from "../components/StudyPagination";
import { CodeBlock, Markdown } from "../lib/Markdown";
import { loadStudy, studyIdea } from "../lib/catalog";
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

  useEffect(() => {
    setTab("play");
    setActiveCodeFile("stage");
    setUseDeviceFrame(GESTURE_STUDIES.has(slug));
    skipFocus.current = true;
  }, [slug]);

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

  const { meta, StudyView, StageView, stageCode = "", machinesCode } = study;
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg shadow-xs"
                title={useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
                aria-label={useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
              >
                {useDeviceFrame ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                <span className="hidden sm:inline">
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
          StudyView ? (
            <div className="study-play">{<StudyView />}</div>
          ) : (
            <p className="page-width py-12 text-[14px] text-fg-muted">{copy.noStudyView}</p>
          )
        ) : tab === "stage" ? (
          StageView ? (
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
                {machinesCode ? (
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
              <CodeBlock
                code={currentCode}
                filename={currentFilename}
                copyLabel={copy.copyCode}
                copiedLabel={copy.copiedCode}
              />
            </div>
          </div>
        ) : (
          <Page as="article" measure="prose" className="note-prose py-12">
            <Markdown source={studyIdea(study, locale)} />
          </Page>
        )}
      </div>

      <div className="page-width pb-16">
        <RelatedDecisions slug={slug} locale={locale} />
        <StudyPagination slug={slug} locale={locale} />
      </div>
    </main>
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
