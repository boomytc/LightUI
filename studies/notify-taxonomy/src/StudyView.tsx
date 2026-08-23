import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./notices/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all speak. They do not interrupt the same way."
              : "看起来都要出声，打断的重量却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Show a notice” describes the skin. The thing that breaks is interruption weight: a glance, auto-dismiss, an undo, a log, or must-handle."
              : "「弹个提示」说的是外观。真正会坏掉的是打断重量：瞄一眼、自动消失、还能撤销、留档，还是必须处理。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the rung, name the scene, then name whether they can miss it. The seven contrasts below are live."
            : "先说档位，再说场景，再说能不能错过。下面七个对照可以点。"}
        </p>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-card">
            <span className="inline-grid size-6 place-items-center rounded-md bg-fg text-[11px] font-semibold text-surface">
              {item.n}
            </span>
            <h2 className="mt-3 text-[15px] font-semibold">{pick(item.title, locale)}</h2>
            <p className="mt-1 text-[13px] text-fg-muted">{pick(item.example, locale)}</p>
          </div>
        ))}
      </section>

      <Playground />

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. A notice is not a dialog" : "1. 提示不是弹窗"}
              </span>
              <br />
              {locale === "en"
                ? "A notice does not interrupt the current task. If they must handle it before they can continue, that is a dialog. An alert must be seen, but it is not a modal."
                : "提示不打断当前任务。必须先处理才能继续，才是弹窗。警告必须看见，但不是模态。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A marquee is not a carousel" : "2. 跑马灯不是轮播"}
              </span>
              <br />
              {locale === "en"
                ? "A marquee rotates copy in one strip and pauses on hover. A carousel takes the whole view away."
                : "跑马灯在同一条里轮流播字，悬停暂停。轮播会把整块画面切走。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. An alert is not a toast" : "3. 警告不是轻提示"}
              </span>
              <br />
              {locale === "en"
                ? "A risk cannot vanish in two seconds. A toast only reports a result that already happened. Progress is not a toast, and an empty state is not a notice."
                : "风险不能两秒后消失。轻提示只报已经发生的结果。进度不是 toast，空状态也不是一条提示。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            weight
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function weight(kind) {
  if (kind === "badge" || kind === "toast") return "weak"
  if (kind === "alert" || kind === "banner") return "strong"
  return "mid"
}

function hideBadge(count) {
  return count <= 0
}

function interruptsTask(kind) {
  return false
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Unload a numeric badge at 0 — no empty dot. None of the seven leaves interrupt the task, including alert."
              : "数字角标在 0 时卸掉，不要留空圆点。七种叶子都不打断任务，包括警告。"}
          </p>
        </article>
      </section>
    </div>
  );
}
