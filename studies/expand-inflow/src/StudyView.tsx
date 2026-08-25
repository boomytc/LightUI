import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./expand/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Extra content either pushes the page, or covers it."
              : "多出来的内容，不是撑开页面，就是盖一层。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make an expand” describes the skin. The thing that breaks is flow versus cover: exclusive accordion, independent collapse, a tree that does not mix expand with select, row detail that moves later rows, read more, or a card that grows in place."
              : "「做个展开」说的是外观。真正会坏掉的是撑开还是盖一层：互斥手风琴、独立折叠、展开不是选中的树、把后面行撑下去的行详情、读更多，还是就地变高的卡。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name flow versus cover. The six contrasts below are live. None of them is a drawer."
            : "先说模型，再说场景，再说撑开还是盖一层。下面六个对照可以点。没有抽屉。"}
        </p>
      </section>

      <Playground />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.example, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Exclusive is not independent collapse" : "1. 互斥不是独立折叠"}
              </span>
              <br />
              {locale === "en"
                ? "An accordion that opens B must close A. Collapse lets several stay open; the count is OPEN n/total."
                : "手风琴开 B 必须关 A。折叠是几块都能开着，计数是 OPEN n/total。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Row detail is not a drawer" : "2. 行详情不是抽屉"}
              </span>
              <br />
              {locale === "en"
                ? "Detail follows the row and inserts under it, so later rows move down. A drawer slides in from the edge and covers the task. This study does not rebuild that."
                : "详情跟这一行走，插在这一行下面，后面的行往下让。抽屉从边上滑进来，盖住当前任务。本则不做抽屉。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Read more is not load more" : "3. 读更多不是加载更多"}
              </span>
              <br />
              {locale === "en"
                ? "Read more grows this block from three lines to full height. Load more appends a page at the end of a list — the list grew; a panel did not open."
                : "读更多是这一块从三行高长到全文高。加载更多是列表末尾再接一页——列表变长，不是一块面板开合。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            coversPage
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function coversPage(kind) {
  return false
}

function exclusiveOpen(kind) {
  return kind === "accordion"
}

function toggleAccordion(openId, id) {
  return openId === id ? null : id
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Every leaf here is in flow. Height is CSS grid 0fr → 1fr. Do not guess max-height. Expand is not select; row detail is not a cover."
              : "本则每片叶子都在流里。高度走 CSS grid 0fr → 1fr，不要猜 max-height。展开不是选中；行详情不是盖一层。"}
          </p>
        </article>
      </section>
    </div>
  );
}
