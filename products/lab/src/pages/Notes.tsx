import { NoteItem } from "../components/NoteItem";
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
        <h1 className="text-[1.8rem] font-semibold tracking-tight">{copy.notesTitle}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{copy.notesLede}</p>
      </header>

      {notes.length === 0 ? (
        <p className="mt-10 text-[13px] text-fg-subtle">{copy.emptyNote}</p>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {notes.map((note) => (
            <NoteItem key={note.slug} note={note} locale={locale} />
          ))}
        </ul>
      )}
    </Page>
  );
}
