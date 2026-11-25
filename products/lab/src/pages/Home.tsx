import { ArrowRight } from "lucide-react";
import { HomeShowcase } from "../components/HomeShowcase";
import { Link } from "../components/Link";
import { NoteItem } from "../components/NoteItem";
import { Page } from "../components/Page";
import { categoryLabel, getStudyCategory } from "../lib/categories";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyAsks, studySummary, studyTitle } from "../lib/localize";
import { loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function Home() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");
  const notes = loadNotes(locale);
  const featured = studies.slice(0, 5);
  const latestNotes = notes.slice(0, 5);

  return (
    <Page as="main" className="pb-20 pt-8 sm:pt-12">
      {/* 全宽宣言开屏：大字阶标题 + 精炼定义 + 唯一主操作 */}
      <section className="space-y-8 sm:space-y-10">
        <div className="space-y-5">
          <h1 className="max-w-[24ch] text-[clamp(2rem,1.25rem+3.1vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-fg">
            {copy.homeTitle}
          </h1>

          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <p className="max-w-[62ch] text-[0.9375rem] leading-[1.65] text-fg-muted">
              {copy.homeLede}
            </p>

            <Link
              href="/studies"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-fg px-5 py-2.5 text-[0.8125rem] font-medium text-surface no-underline transition-opacity duration-150 hover:opacity-90"
            >
              <span>{copy.homeSeeWorks}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* 横跨主栅格的单层制图点阵实验台 */}
        <HomeShowcase locale={locale} />
      </section>

      {/* 下半屏：瑞士细线双栏内容索引 */}
      <div className="mt-16 grid gap-14 border-t border-border pt-12 lg:grid-cols-2 lg:gap-16">
        <section className="min-w-0">
          <SectionHead
            title={copy.homeWorks}
            href="/studies"
            extra={copy.worksCount(studies.length)}
            all={copy.homeAll}
          />
          {featured.length === 0 ? (
            <Empty>{copy.emptyStudy}</Empty>
          ) : (
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {featured.map((study) => (
                <FeaturedRow key={study.meta.slug} study={study.meta} locale={locale} />
              ))}
            </ul>
          )}
        </section>

        <section className="min-w-0">
          <SectionHead
            title={copy.homeNotes}
            href="/notes"
            extra={notes.length ? copy.notesCount(notes.length) : undefined}
            all={copy.homeAll}
          />
          {latestNotes.length === 0 ? (
            <Empty>{copy.emptyNote}</Empty>
          ) : (
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {latestNotes.map((note) => (
                <NoteItem key={note.slug} note={note} locale={locale} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </Page>
  );
}

function FeaturedRow({ study, locale }: { study: StudyMeta; locale: Locale }) {
  const asks = studyAsks(study, locale);
  const category = getStudyCategory(study);

  return (
    <li>
      <Link
        href={`/s/${study.slug}`}
        className="group block py-4 no-underline transition-colors duration-150 hover:bg-surface/60 sm:px-3 sm:-mx-3 sm:rounded-lg"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] text-fg transition-colors duration-150 group-hover:text-accent">
            {studyTitle(study, locale)}
          </h3>
          <div className="flex shrink-0 items-center gap-2 text-[0.8125rem] text-fg-subtle">
            <span>{categoryLabel(category, locale)}</span>
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
        </div>

        {asks ? (
          <p className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-fg">{asks}</p>
        ) : null}

        <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-fg-muted">
          {studySummary(study, locale)}
        </p>
      </Link>
    </li>
  );
}

function SectionHead({
  title,
  href,
  extra,
  all,
}: {
  title: string;
  href: string;
  extra?: string;
  all: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">{title}</h2>
        {extra ? <span className="text-[0.8125rem] tabular-nums text-fg-subtle">{extra}</span> : null}
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-fg"
      >
        <span>{all}</span>
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <p className="mt-5 border-y border-dashed border-border py-10 text-[0.8125rem] text-fg-subtle">
      {children}
    </p>
  );
}
