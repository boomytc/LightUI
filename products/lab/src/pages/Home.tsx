import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { HomeShowcase } from "../components/HomeShowcase";
import { Link } from "../components/Link";
import { NoteItem } from "../components/NoteItem";
import { Page } from "../components/Page";
import { CATEGORIES, categoryLabel, getStudyCategory } from "../lib/categories";
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
  const featured = studies.slice(0, 4);
  const lead = featured[0];
  const rest = featured.slice(1);
  const latestNotes = notes.slice(0, 4);

  return (
    <Page as="main" className="pb-20 pt-10 sm:pt-14">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
        <div className="lab-rise min-w-0">
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

          <div className="mt-8 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-4">
            <span className="mr-1 text-[11px] font-medium text-fg-subtle">
              {locale === "en" ? "Categories:" : "领域分类:"}
            </span>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <Link
                key={cat.id}
                href={`/studies?category=${cat.id}`}
                className="rounded-md border border-border/80 bg-surface px-2.5 py-1 text-[11px] font-medium text-fg-muted no-underline transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-fg"
              >
                {locale === "en" ? cat.nameEn : cat.nameZh}
              </Link>
            ))}
          </div>
        </div>

        <div className="lab-rise lab-delay-2 w-full min-w-0">
          <HomeShowcase locale={locale} />
        </div>
      </section>

      <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-16">
        <section className="lab-rise lab-delay-3 min-w-0">
          <SectionHead title={copy.homeWorks} href="/studies" extra={copy.worksCount(studies.length)} all={copy.homeAll} />
          {featured.length === 0 ? (
            <Empty>{copy.emptyStudy}</Empty>
          ) : (
            <div className="mt-5 space-y-3">
              {lead ? <FeaturedLead study={lead.meta} locale={locale} /> : null}
              {rest.length > 0 ? (
                <ul className="lab-stagger divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                  {rest.map((study, i) => (
                    <FeaturedRow key={study.meta.slug} study={study.meta} locale={locale} index={i + 2} />
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>

        <section className="lab-rise lab-delay-4 min-w-0">
          <SectionHead
            title={copy.homeNotes}
            href="/notes"
            extra={notes.length ? copy.notesCount(notes.length) : undefined}
            all={copy.homeAll}
          />
          {latestNotes.length === 0 ? (
            <Empty>{copy.emptyNote}</Empty>
          ) : (
            <ul className="lab-stagger mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
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

function FeaturedLead({ study, locale }: { study: StudyMeta; locale: Locale }) {
  const asks = studyAsks(study, locale);
  const category = getStudyCategory(study.slug);

  return (
    <Link
      href={`/s/${study.slug}`}
      className="lab-card group block rounded-2xl border border-border bg-surface p-5 no-underline shadow-card motion-safe:hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[11px] text-fg-subtle">01</span>
          <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
            {categoryLabel(category, locale)}
          </span>
        </div>
        <ArrowRight className="size-3.5 shrink-0 text-fg-subtle opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-fg group-hover:opacity-100" />
      </div>

      <h3 className="mt-3 text-[1.35rem] font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
        {studyTitle(study, locale)}
      </h3>

      {asks ? (
        <div className="mt-2.5 flex items-start gap-1.5 text-[13px] font-medium text-fg">
          <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-accent" />
          <span>{asks}</span>
        </div>
      ) : null}

      <p className="mt-2 text-[13px] leading-relaxed text-fg-muted break-keep">{studySummary(study, locale)}</p>
    </Link>
  );
}

function FeaturedRow({
  study,
  locale,
  index,
}: {
  study: StudyMeta;
  locale: Locale;
  index: number;
}) {
  const asks = studyAsks(study, locale);
  const category = getStudyCategory(study.slug);

  return (
    <li>
      <Link href={`/s/${study.slug}`} className="group block px-4 py-3.5 no-underline transition-colors hover:bg-surface-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="w-5 shrink-0 font-mono text-[11px] text-fg-subtle">{String(index).padStart(2, "0")}</span>
            <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
              {categoryLabel(category, locale)}
            </span>
            <span className="truncate text-[15px] font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
              {studyTitle(study, locale)}
            </span>
          </div>
          <ArrowRight className="size-3.5 shrink-0 text-fg-subtle opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-fg group-hover:opacity-100" />
        </div>

        {asks ? (
          <div className="mt-1.5 flex items-center gap-1.5 pl-7 text-[12px] font-medium text-fg">
            <HelpCircle className="size-3 shrink-0 text-accent" />
            <span className="line-clamp-1">{asks}</span>
          </div>
        ) : null}

        <span className="mt-1 block pl-7 text-[13px] leading-relaxed text-fg-muted break-keep line-clamp-2">
          {studySummary(study, locale)}
        </span>
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
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
      <div className="flex items-center gap-3 text-[12px] text-fg-subtle">
        {extra ? <span>{extra}</span> : null}
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-fg"
        >
          {all}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-dashed border-border px-5 py-10 text-[13px] text-fg-subtle">{children}</p>
  );
}
