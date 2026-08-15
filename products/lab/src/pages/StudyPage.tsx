import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "../components/Link";
import { Markdown } from "../lib/Markdown";
import { loadStudy } from "../lib/catalog";

export function StudyPage({ slug }: { slug: string }) {
  const study = loadStudy(slug);
  const [tab, setTab] = useState<"play" | "idea">("play");

  if (!study) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-[15px] text-fg-muted">没有这个 study：{slug}</p>
        <BackLink />
      </main>
    );
  }

  const { meta, idea, StudyView } = study;

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <BackLink />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight">{meta.title}</p>
              <p className="truncate text-[12px] text-fg-subtle">{meta.origin.label}</p>
            </div>
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            <TabButton active={tab === "play"} onClick={() => setTab("play")}>
              演示
            </TabButton>
            <TabButton active={tab === "idea"} onClick={() => setTab("idea")}>
              理念
            </TabButton>
          </div>
        </div>
      </div>

      {tab === "play" ? (
        StudyView ? (
          <StudyView />
        ) : (
          <p className="mx-auto max-w-6xl px-5 py-12 text-[14px] text-fg-muted sm:px-8">
            这个 study 还没有 StudyView。
          </p>
        )
      ) : (
        <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
          <Markdown source={idea} />
        </article>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/studies"
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-fg-muted no-underline hover:bg-surface-2 hover:text-fg"
    >
      <ArrowLeft className="size-3.5" />
      作品
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
