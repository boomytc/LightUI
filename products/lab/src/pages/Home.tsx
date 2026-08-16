import { Link } from "../components/Link";
import { NoteItem } from "../components/NoteItem";
import { Page } from "../components/Page";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studySummary, studyTitle } from "../lib/localize";
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
    <Page as="main" className="pb-20 pt-12 sm:pt-16">
      <section>
        <h1 className="text-[2.1rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.6rem]">
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
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {featured.map((study) => (
                <li key={study.meta.slug}>
                  <Link href={`/s/${study.meta.slug}`} className="group block py-3.5 no-underline">
                    <span className="block text-[15px] font-medium tracking-tight text-fg group-hover:text-accent">
                      {studyTitle(study.meta, locale)}
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-fg-muted break-keep">
                      {studySummary(study.meta, locale)}
                    </span>
                  </Link>
                </li>
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
