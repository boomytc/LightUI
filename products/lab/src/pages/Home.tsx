import { Link } from "../components/Link";
import { StudyCard } from "../components/StudyCard";
import { loadStudies } from "../lib/catalog";
import { loadNotes } from "../lib/notes";

export function Home() {
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");
  const notes = loadNotes();
  const featured = studies[0];
  const latestNotes = notes.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <section className="max-w-2xl">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Notebook</p>
        <h1 className="mt-3 text-[2.1rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.6rem]">
          一本可以点开的 UI/UX 笔记本。
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
          作品是可以再摸一遍的交互。笔记写它为什么值得留下。不是组件库，也不是产品壳。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/studies"
            className="inline-flex h-9 items-center rounded-lg bg-fg px-3.5 text-[13px] font-medium text-surface no-underline"
          >
            看作品
          </Link>
          <Link
            href="/notes"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-[13px] font-medium text-fg no-underline hover:bg-surface-2"
          >
            读笔记
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <SectionHead title="作品" href="/studies" extra={`${studies.length} 则`} />
        {featured ? (
          <div className="mt-4 max-w-xl">
            <StudyCard meta={featured.meta} />
          </div>
        ) : (
          <Empty>还没有 study。</Empty>
        )}
      </section>

      <section className="mt-16">
        <SectionHead title="笔记" href="/notes" extra={notes.length ? `${notes.length} 篇` : undefined} />
        {latestNotes.length === 0 ? (
          <Empty>还没有笔记。</Empty>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {latestNotes.map((note) => (
              <li key={note.slug}>
                <Link
                  href={`/notes/${note.slug}`}
                  className="flex flex-col gap-1 py-4 no-underline sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <time className="shrink-0 font-mono text-[12px] text-fg-subtle" dateTime={note.date}>
                    {note.date}
                  </time>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-fg">{note.title}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-fg-muted">{note.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SectionHead({ title, href, extra }: { title: string; href: string; extra?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-[13px] font-medium text-fg-muted">{title}</h2>
      <div className="flex items-center gap-3 text-[12px] text-fg-subtle">
        {extra ? <span>{extra}</span> : null}
        <Link href={href} className="no-underline hover:text-fg">
          全部
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
