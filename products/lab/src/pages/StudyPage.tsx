import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "../components/Link";
import { Page } from "../components/Page";
import { Markdown } from "../lib/Markdown";
import { loadStudy, studyIdea } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyTitle } from "../lib/localize";
import { usePrefs } from "../lib/prefs";

export function StudyPage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const study = loadStudy(slug);
  const [tab, setTab] = useState<"play" | "idea">("play");

  if (!study) {
    return (
      <Page as="main" className="py-16">
        <p className="text-[15px] text-fg-muted">{copy.missingStudy(slug)}</p>
        <BackLink label={copy.backWorks} />
      </Page>
    );
  }

  const { meta, StudyView } = study;

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="page-width flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <BackLink label={copy.backWorks} />
            <p className="truncate text-[14px] font-semibold tracking-tight">{studyTitle(meta, locale)}</p>
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            <TabButton active={tab === "play"} onClick={() => setTab("play")}>
              {copy.tabPlay}
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
      ) : (
        <Page as="article" measure="prose" className="py-12">
          <Markdown source={studyIdea(study, locale)} />
        </Page>
      )}
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Link
      href="/studies"
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-fg-muted no-underline hover:bg-surface-2 hover:text-fg"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Link>
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
