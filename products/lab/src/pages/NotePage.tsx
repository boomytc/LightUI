import { Link } from "../components/Link";
import { Markdown } from "../lib/Markdown";
import { loadNote } from "../lib/notes";
import { loadStudy } from "../lib/catalog";

export function NotePage({ slug }: { slug: string }) {
  const note = loadNote(slug);

  if (!note) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-[15px] text-fg-muted">没有这篇笔记：{slug}</p>
        <Link href="/notes" className="mt-4 inline-block text-[13px] text-fg-muted no-underline hover:text-fg">
          全部笔记
        </Link>
      </main>
    );
  }

  const related = note.related
    .map((id) => loadStudy(id)?.meta)
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
      <p className="font-mono text-[12px] text-fg-subtle">
        <Link href="/notes" className="no-underline hover:text-fg">
          笔记
        </Link>
        <span className="mx-2">/</span>
        <time dateTime={note.date}>{note.date}</time>
      </p>
      <div className="mt-6">
        <Markdown source={`# ${note.title}\n\n${note.body}`} />
      </div>
      {related.length > 0 ? (
        <aside className="mt-14 border-t border-border pt-6">
          <p className="text-[12px] font-medium text-fg-subtle">相关作品</p>
          <ul className="mt-3 space-y-2">
            {related.map((meta) => (
              <li key={meta.slug}>
                <Link href={`/s/${meta.slug}`} className="text-[14px] text-accent no-underline hover:underline">
                  {meta.title}
                </Link>
                <span className="mt-0.5 block text-[13px] text-fg-muted">{meta.summary}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
