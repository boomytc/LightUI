import { Link } from "../components/Link";
import { loadNotes } from "../lib/notes";

export function Notes() {
  const notes = loadNotes();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-12 sm:px-8">
      <header>
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Notes</p>
        <h1 className="mt-3 text-[1.8rem] font-semibold tracking-tight">笔记</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
          写为什么值得留下。算法和对照 playground 放在对应的 study 里。
        </p>
      </header>

      {notes.length === 0 ? (
        <p className="mt-10 text-[13px] text-fg-subtle">还没有笔记。见 docs/writing.md。</p>
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
    </main>
  );
}
