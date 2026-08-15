import { Link } from "../components/Link";
import { Page } from "../components/Page";
import { messages } from "../lib/i18n";
import { loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";

export function Notes() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const notes = loadNotes(locale);

  return (
    <Page as="main" measure="prose" className="pb-20 pt-12">
      <header>
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{copy.notesEyebrow}</p>
        <h1 className="mt-3 text-[1.8rem] font-semibold tracking-tight">{copy.notesTitle}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{copy.notesLede}</p>
      </header>

      {notes.length === 0 ? (
        <p className="mt-10 text-[13px] text-fg-subtle">{copy.emptyNote}</p>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link
                href={`/notes/${note.slug}`}
                className="flex flex-col gap-1 py-5 no-underline sm:flex-row sm:items-baseline sm:gap-8"
              >
                <time className="w-28 shrink-0 font-mono text-[12px] text-fg-subtle" dateTime={note.date}>
                  {note.date}
                </time>
                <span className="min-w-0">
                  <span className="block text-[16px] font-medium tracking-tight text-fg">{note.title}</span>
                  <span className="mt-1.5 block text-[14px] leading-relaxed text-fg-muted">{note.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
