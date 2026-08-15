import { Link } from "../components/Link";
import { NoteItem } from "../components/NoteItem";
import { Page } from "../components/Page";
import { StudyCard } from "../components/StudyCard";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";

export function Home() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");
  const notes = loadNotes(locale);
  const featured = studies.slice(0, 4);
  const latestNotes = notes.slice(0, 3);

  return (
    <Page as="main" className="pb-20 pt-12 sm:pt-16">
      <section>
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{copy.homeEyebrow}</p>
        <h1 className="mt-3 text-[2.1rem] font-semibold leading-[1.15] tracking-tight break-keep sm:text-[2.6rem]">
          {copy.homeTitle}
        </h1>
        <p className="mt-4 max-w-[42rem] text-[15px] leading-relaxed text-fg-muted">{copy.homeLede}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/studies"
            className="inline-flex h-9 items-center rounded-lg bg-fg px-3.5 text-[13px] font-medium text-surface no-underline"
          >
            {copy.homeSeeWorks}
          </Link>
          <Link
            href="/graph"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-[13px] font-medium text-fg no-underline hover:bg-surface-2"
          >
            {copy.homeSeeGraph}
          </Link>
          <Link
            href="/notes"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-[13px] font-medium text-fg no-underline hover:bg-surface-2"
          >
            {copy.homeReadNotes}
          </Link>
        </div>
      </section>

      <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-16">
        <section className="min-w-0">
          <SectionHead title={copy.homeWorks} href="/studies" extra={copy.worksCount(studies.length)} all={copy.homeAll} />
          {featured.length === 0 ? (
            <Empty>{copy.emptyStudy}</Empty>
          ) : (
            <div className="mt-4 grid gap-4">
              {featured.map((study) => (
                <StudyCard key={study.meta.slug} meta={study.meta} locale={locale} />
              ))}
            </div>
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
