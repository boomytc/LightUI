import { DateStamp } from "../components/DateStamp";
import { Link } from "../components/Link";
import { Page } from "../components/Page";
import { Markdown } from "../lib/Markdown";
import { messages } from "../lib/i18n";
import { loadNote } from "../lib/notes";
import { loadStudy } from "../lib/catalog";
import { studySummary, studyTitle } from "../lib/localize";
import { usePrefs } from "../lib/prefs";

export function NotePage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const note = loadNote(slug, locale);

  if (!note) {
    return (
      <Page as="main" measure="prose" className="py-16">
        <p className="text-[15px] text-fg-muted">{copy.missingNote(slug)}</p>
        <Link href="/notes" className="mt-4 inline-block text-[13px] text-fg-muted no-underline hover:text-fg">
          {copy.allNotes}
        </Link>
      </Page>
    );
  }

  const related = note.related
    .map((id) => loadStudy(id)?.meta)
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <Page as="article" measure="prose" className="py-12">
      <p className="font-mono text-[12px] text-fg-subtle">
        <Link href="/notes" className="no-underline hover:text-fg">
          {copy.notesIndex}
        </Link>
        <span className="mx-2">/</span>
        <DateStamp created={note.date} updated={note.updated} locale={locale} />
      </p>
      <div className="mt-6">
        <Markdown source={`# ${note.title}\n\n${note.body}`} />
      </div>
      {related.length > 0 ? (
        <aside className="mt-14 border-t border-border pt-6">
          <p className="text-[12px] font-medium text-fg-subtle">{copy.relatedWorks}</p>
          <ul className="mt-3 space-y-2">
            {related.map((meta) => (
              <li key={meta.slug}>
                <Link href={`/s/${meta.slug}`} className="text-[14px] text-accent no-underline hover:underline">
                  {studyTitle(meta, locale)}
                </Link>
                <span className="mt-0.5 block text-[13px] text-fg-muted">{studySummary(meta, locale)}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </Page>
  );
}
