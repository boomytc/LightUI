import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./meters/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "A spinner only says you are waiting. First ask whether progress can be measured."
              : "转圈只说了在等。先问进度能不能算。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a progress bar” describes the skin. The thing that breaks is a fake percent on work with no ETA, or a spinner on work that already knows its bytes."
              : "「做个进度条」说的是外观。真正会坏掉的是不能算却画假百分比，或能算却永远转圈。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "If it can be measured, walk to 100 and stop. If it cannot, loop — never a fake percent. The eight leaves below are live."
            : "能算就走到 100 停住；不能算就循环，不要假百分比。下面八片叶子可以点。"}
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
                {locale === "en"
                  ? "1. Measurable work does not loop a fake percent"
                  : "1. 能算的不要循环假百分比"}
              </span>
              <br />
              {locale === "en"
                ? "Fill, steps, the ring, and the liquid walk 0→1 and stop. Indeterminate work loops with no number."
                : "填充、步骤、圆环、液面从 0 走到 1 就停。不能算的只循环，不写数字。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Stage steps are not tab chevrons" : "2. 阶段步骤不是页签鱼骨"}
              </span>
              <br />
              {locale === "en"
                ? "A chevron row is a navigation selection model. Here the nodes are the work: done, active, todo."
                : "鱼骨是导航的选中模型。这里的节点就是工作本身：完成、当前、未开始。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. Progress is not a toast, and not a skeleton"
                  : "3. 进度不是 toast，也不是骨架"}
              </span>
              <br />
              {locale === "en"
                ? "A toast is the result. A skeleton holds layout. Progress is the work still happening."
                : "toast 说的是结果已经出来。骨架占的是布局位子。进度是工作正在发生。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            category
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function category(kind) {
  return DETERMINATE.has(kind)
    ? "determinate"
    : "indeterminate"
}

function circularOffset(p, C) {
  return C * (1 - clampProgress(p))
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Fill uses scaleX, not width. Determinate stops at 1. Indeterminate loops. Reduced motion freezes p or becomes a static mark."
              : "填充用 scaleX，不用 width。能算的停在 1。不能算的循环。减少动效时停在 p，或变成静止标记。"}
          </p>
        </article>
      </section>
    </div>
  );
}
