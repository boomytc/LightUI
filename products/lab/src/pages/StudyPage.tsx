import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { Page } from "../components/Page";
import { RelatedDecisions } from "../components/RelatedDecisions";
import { Markdown } from "../lib/Markdown";
import { loadStudy, studyIdea } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyTitle } from "../lib/localize";
import { usePrefs } from "../lib/prefs";

export function StudyPage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const study = loadStudy(slug);
  const [tab, setTab] = useState<"play" | "stage" | "idea">("play");

  if (!study) {
    return (
      <Page as="main" className="py-16">
        <p className="text-[15px] text-fg-muted">{copy.missingStudy(slug)}</p>
        <BackLink fallback="/studies" />
      </Page>
    );
  }

  const { meta, StudyView, StageView } = study;

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="page-width flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <BackLink fallback="/studies" />
            <p className="truncate text-[14px] font-semibold tracking-tight">{studyTitle(meta, locale)}</p>
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            <TabButton active={tab === "play"} onClick={() => setTab("play")}>
              {copy.tabPlay}
            </TabButton>
            <TabButton active={tab === "stage"} onClick={() => setTab("stage")}>
              {copy.tabStage}
            </TabButton>
            <TabButton active={tab === "idea"} onClick={() => setTab("idea")}>
              {copy.tabIdea}
            </TabButton>
          </div>
        </div>
      </div>

      {tab === "play" ? (
        StudyView ? (
          <StudyView />
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-fg no-underline shadow-sm transition-colors hover:bg-surface-2"
                >
                  {copy.openStandaloneStage}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
              <div className="w-full min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-10">
                <StageView />
              </div>
            </div>
          </div>
        ) : (
          <p className="page-width py-12 text-[14px] text-fg-muted">{copy.noStageView}</p>
        )
      ) : (
        <Page as="article" measure="prose" className="py-12">
          <Markdown source={studyIdea(study, locale)} />
        </Page>
      )}

      <div className="page-width pb-20">
        <RelatedDecisions slug={slug} locale={locale} />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-fg px-3 py-1 text-[12px] font-medium text-surface"
          : "rounded-md px-3 py-1 text-[12px] font-medium text-fg-muted hover:text-fg"
      }
    >
      {children}
    </button>
  );
}
