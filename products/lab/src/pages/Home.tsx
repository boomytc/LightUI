import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { HomeShowcase } from "../components/HomeShowcase";
import { Link } from "../components/Link";
import { NoteItem } from "../components/NoteItem";
import { Page } from "../components/Page";
import { CATEGORIES, getStudyCategory } from "../lib/categories";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyAsks, studySummary, studyTitle } from "../lib/localize";
import { loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";

export function Home() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");
  const notes = loadNotes(locale);
  const featured = studies.slice(0, 4);
  const latestNotes = notes.slice(0, 4);

  return (
    <Page as="main" className="pb-20 pt-10 sm:pt-14">
      {/* Hero with interactive showcase */}
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-fg-muted shadow-xs">
            <Sparkles className="size-3 text-accent" />
            <span>LightUI · Interactive UI/UX Studies</span>
          </div>

          <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.7rem]">
            {copy.homeTitle}
          </h1>
          <p className="mt-4 max-w-[38rem] text-[15px] leading-relaxed text-fg-muted">{copy.homeLede}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/studies"
              className="inline-flex h-9 items-center rounded-lg bg-fg px-4 text-[13px] font-medium text-surface no-underline shadow-xs transition-opacity hover:opacity-90"
            >
              {copy.homeSeeWorks}
            </Link>
            <Link
              href="/graph"
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-[13px] font-medium text-fg no-underline shadow-xs transition-colors hover:bg-surface-2"
            >
              {copy.homeSeeGraph}
            </Link>
            <Link
              href="/notes"
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-[13px] font-medium text-fg no-underline shadow-xs transition-colors hover:bg-surface-2"
            >
              {copy.homeReadNotes}
            </Link>
          </div>

          {/* Quick Category Chips */}
          <div className="mt-8 flex flex-wrap items-center gap-1.5 pt-4 border-t border-border/70">
            <span className="mr-1 text-[11px] font-medium text-fg-subtle">
              {locale === "en" ? "Categories:" : "领域分类:"}
            </span>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <Link
                key={cat.id}
                href="/studies"
                className="rounded-md border border-border/80 bg-surface px-2 py-1 text-[11px] text-fg-muted no-underline transition-colors hover:border-border-strong hover:text-fg"
              >
                {locale === "en" ? cat.nameEn : cat.nameZh}
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full min-w-0">
          <HomeShowcase locale={locale} />
        </div>
      </section>

      {/* Featured Works & Latest Notes */}
      <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-16">
        <section className="min-w-0">
          <SectionHead title={copy.homeWorks} href="/studies" extra={copy.worksCount(studies.length)} all={copy.homeAll} />
          {featured.length === 0 ? (
            <Empty>{copy.emptyStudy}</Empty>
          ) : (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {featured.map((study) => {
                const asks = studyAsks(study.meta, locale);
                const category = getStudyCategory(study.meta.slug);
                return (
                  <li key={study.meta.slug}>
                    <Link href={`/s/${study.meta.slug}`} className="group block py-4 no-underline">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-sm bg-accent-soft px-1.5 py-0.5 text-[10px] font-mono text-accent uppercase">
                            {category}
                          </span>
                          <span className="text-[15px] font-semibold tracking-tight text-fg group-hover:text-accent transition-colors">
                            {studyTitle(study.meta, locale)}
                          </span>
                        </div>
                        <ArrowRight className="size-3.5 text-fg-subtle opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-fg" />
                      </div>

                      {asks ? (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-fg">
                          <HelpCircle className="size-3 text-accent shrink-0" />
                          <span>{asks}</span>
                        </div>
                      ) : null}

                      <span className="mt-1.5 block text-[13px] leading-relaxed text-fg-muted break-keep">
                        {studySummary(study.meta, locale)}
                      </span>
                    </Link>
                  </li>
                );
              })}
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
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {latestNotes.map((note) => (
                <NoteItem key={note.slug} note={note} locale={locale} compact />
              ))}
            </ul>
          )}
        </section>
      </div>
    </Page>
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
      <h2 className="text-[13px] font-medium text-fg-muted">{title}</h2>
      <div className="flex items-center gap-3 text-[12px] text-fg-subtle">
        {extra ? <span>{extra}</span> : null}
        <Link href={href} className="no-underline hover:text-fg">
          {all}
        </Link>
      </div>
    </div>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <p className="mt-4 rounded-2xl border border-dashed border-border px-5 py-10 text-[13px] text-fg-subtle">
      {children}
    </p>
  );
}
