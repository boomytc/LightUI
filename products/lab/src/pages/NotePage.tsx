import { ArrowRight, ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
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
        <p className="text-[15px] text-fg-muted">{copy.missingNote(slug)}</p>
        <Link href="/notes" className="mt-4 inline-block text-[13px] text-fg-muted no-underline hover:text-fg">
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

  return (
    <Page as="main" className="pb-24 pt-8">
      <article className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start lg:gap-x-14">
        <div className="min-w-0">
          <BackLink
            fallback="/notes"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 -ml-2 text-[13px] text-fg-muted no-underline transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          />
          <h1 className="mt-4 text-[1.85rem] font-semibold tracking-tight sm:text-[2.25rem]">
            {note.title}
          </h1>
          <NoteByline note={note} locale={locale} className="mt-3" />

          {note.summary ? (
            <p className="mt-6 border-l-[3px] border-accent pl-4 text-[15px] leading-relaxed text-fg-muted">
              {note.summary}
            </p>
          ) : null}

          <div className="note-prose mt-8 border-t border-border/70 pt-8">
            <Markdown source={note.body} />
          </div>

          <NotePagination slug={slug} locale={locale} />
        </div>

        <aside className="mt-12 space-y-6 lg:sticky lg:top-24 lg:mt-8">
          {related.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                {copy.relatedStudyBadge}
              </p>
              {related.map((meta) => (
                <TryCard key={meta.slug} meta={meta} locale={locale} copy={copy} />
              ))}
            </div>
          ) : null}

          {domainNotes.length > 0 ? (
            <div className="rounded-2xl border border-border bg-surface/80 p-5 shadow-card">
              <div className="flex items-center gap-2 border-b border-border/70 pb-3 text-[13px] font-semibold text-fg">
                <BookOpen className="size-4 text-accent" />
                <span>{copy.moreInDomain}</span>
              </div>
              <div className="mt-2">
                {domainNotes.map((dNote) => (
                  <Link
                    key={dNote.slug}
                    href={`/notes/${dNote.slug}`}
                    className="group -mx-1.5 block rounded-lg px-1.5 py-2.5 no-underline transition-colors duration-150 hover:bg-surface-2"
                  >
                    <p className="text-[13px] font-medium text-fg transition-colors duration-150 group-hover:text-accent line-clamp-2">
                      {dNote.title}
                    </p>
                    {dNote.summary ? (
                      <p className="mt-1 text-[11px] text-fg-muted line-clamp-1">
                        {dNote.summary}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </article>
    </Page>
  );
}

function TryCard({
  meta,
  locale,
  copy,
}: {
  meta: StudyMeta;
  locale: Locale;
  copy: ReturnType<typeof messages>;
}) {
  const category = getStudyCategory(meta.slug);
  const asks = studyAsks(meta, locale);

  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-5 shadow-card transition-colors duration-200 hover:border-border-strong">
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
          {categoryLabel(category, locale)}
        </span>
        <Sparkles className="size-3.5 text-accent" />
      </div>

      <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-fg">
        {studyTitle(meta, locale)}
      </h3>

      {asks ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-fg-muted line-clamp-2">
          {asks}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
        <Link
          href={`/s/${meta.slug}`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-fg px-3 py-2 text-[12px] font-semibold text-surface no-underline shadow-xs transition-opacity duration-150 hover:opacity-90"
        >
          <span>{copy.tryWork}</span>
          <ArrowRight className="size-3" />
        </Link>
        <a
          href={`/s/${meta.slug}/stage`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-2 text-[12px] font-medium text-fg no-underline transition-colors duration-150 hover:bg-surface-2"
        >
          <span>{copy.inspectorStage}</span>
          <ArrowUpRight className="size-3 text-fg-subtle" />
        </a>
      </div>
    </div>
  );
}
