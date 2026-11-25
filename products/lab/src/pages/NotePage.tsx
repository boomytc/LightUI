import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { Link } from "../components/Link";
import { NoteByline, relatedMetas } from "../components/NoteItem";
import { NotePagination } from "../components/NotePagination";
import { Page } from "../components/Page";
import { categoryLabel, getStudyCategory } from "../lib/categories";
import { Markdown } from "../lib/Markdown";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
import { getNoteCategory, loadNote, loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function NotePage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const note = loadNote(slug, locale);

  if (!note) {
    return (
      <Page as="main" className="py-12">
        <p className="text-[0.9375rem] text-fg-muted">{copy.missingNote(slug)}</p>
        <Link
          href="/notes"
          className="mt-4 inline-block text-[0.8125rem] font-medium text-accent no-underline hover:underline"
        >
          {copy.allNotes}
        </Link>
      </Page>
    );
  }

  const related = relatedMetas(note);
  const noteCat = getNoteCategory(note);
  const allNotes = loadNotes(locale);
  const domainNotes = allNotes
    .filter((n) => n.slug !== note.slug && getNoteCategory(n) === noteCat)
    .slice(0, 3);
  const hasSidebar = related.length > 0 || domainNotes.length > 0;

  return (
    <Page as="main" className="pb-24 pt-8 sm:pt-10">
      <article
        className={
          hasSidebar
            ? "mx-auto max-w-[66rem] lg:grid lg:grid-cols-[minmax(0,62ch)_17.5rem] lg:items-start lg:justify-between lg:gap-x-14"
            : "mx-auto max-w-[62ch]"
        }
      >
        <div className="min-w-0 max-w-[62ch]">
          <BackLink
            fallback="/notes"
            className="-ml-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[0.8125rem] text-fg-muted no-underline transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          />
          <h1 className="mt-4 text-[clamp(1.75rem,1.3rem+1.6vw,2.375rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-fg">
            {note.title}
          </h1>
          <NoteByline note={note} locale={locale} className="mt-3" />

          {note.summary ? (
            <p className="mt-6 border-l-2 border-accent pl-4 text-[0.9375rem] leading-[1.7] text-fg-muted">
              {note.summary}
            </p>
          ) : null}

          <div className="note-prose mt-8 border-t border-border pt-8">
            <Markdown source={note.body} locale={locale} />
          </div>

          <NotePagination slug={slug} locale={locale} />
        </div>

        {hasSidebar ? (
          <aside className="mt-12 space-y-8 border-t border-border pt-8 lg:sticky lg:top-20 lg:mt-10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {related.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-[0.8125rem] font-semibold text-fg-subtle">
                  {copy.relatedStudyBadge}
                </h2>
                <div className="divide-y divide-border">
                  {related.map((meta) => (
                    <TryStudyItem key={meta.slug} meta={meta} locale={locale} copy={copy} />
                  ))}
                </div>
              </div>
            ) : null}

            {domainNotes.length > 0 ? (
              <div className="space-y-3 border-t border-border pt-6">
                <h2 className="text-[0.8125rem] font-semibold text-fg-subtle">
                  {copy.moreInDomain}
                </h2>
                <ul className="divide-y divide-border">
                  {domainNotes.map((dNote) => (
                    <li key={dNote.slug}>
                      <Link
                        href={`/notes/${dNote.slug}`}
                        className="group block py-3 no-underline"
                      >
                        <p className="line-clamp-2 text-[0.9375rem] font-medium leading-snug text-fg transition-colors duration-150 group-hover:text-accent">
                          {dNote.title}
                        </p>
                        {dNote.summary ? (
                          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                            {dNote.summary}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        ) : null}
      </article>
    </Page>
  );
}

function TryStudyItem({
  meta,
  locale,
  copy,
}: {
  meta: StudyMeta;
  locale: Locale;
  copy: ReturnType<typeof messages>;
}) {
  const category = getStudyCategory(meta);
  const asks = studyAsks(meta, locale);

  return (
    <div className="max-w-sm py-3 first:pt-0 lg:max-w-none">
      <p className="text-[0.8125rem] text-fg-subtle">{categoryLabel(category, locale)}</p>
      <h3 className="mt-1 text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
        {studyTitle(meta, locale)}
      </h3>

      {asks ? (
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">{asks}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link
          href={`/s/${meta.slug}`}
          className="inline-flex min-h-9 w-fit items-center gap-1.5 rounded-lg bg-fg px-4 py-2 text-[0.8125rem] font-medium text-surface no-underline transition-opacity duration-150 hover:opacity-90"
        >
          <span>{copy.tryWork}</span>
          <ArrowRight className="size-3.5" />
        </Link>
        <a
          href={`/s/${meta.slug}/stage`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-accent"
        >
          <span>{copy.inspectorStage}</span>
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
