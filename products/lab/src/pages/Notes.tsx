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
    <Page as="main" className="pb-14 pt-8">
      <header>
        <h1 className="text-[1.8rem] font-semibold tracking-tight">{copy.notesTitle}</h1>
        <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-fg-muted">{copy.notesLede}</p>
      </header>

      {notes.length === 0 ? (
        <p className="mt-8 text-[13px] text-fg-subtle">{copy.emptyNote}</p>
      ) : (
        <ul className="mt-8 grid border-t border-border md:grid-cols-2">
          {notes.map((note) => (
            <NoteItem
              key={note.slug}
              note={note}
              locale={locale}
              className="border-b border-border md:odd:pr-10 md:even:pl-10 lg:odd:pr-12 lg:even:pl-12"
            />
          ))}
        </ul>
      )}
    </Page>
  );
}
