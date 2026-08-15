import { StudyCard } from "../components/StudyCard";
import { loadStudies } from "../lib/catalog";

export function Studies() {
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:px-8">
      <header className="max-w-2xl">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Studies</p>
        <h1 className="mt-3 text-[1.8rem] font-semibold tracking-tight">作品</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
          每则 study 是一条可操作的规则。点进去可以试，理念页写判定本身。
        </p>
      </header>

      {studies.length === 0 ? (
        <p className="mt-10 text-[13px] text-fg-subtle">还没有 study。见 docs/conventions.md。</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {studies.map((s) => (
            <StudyCard key={s.meta.slug} meta={s.meta} />
          ))}
        </div>
      )}
    </main>
  );
}
