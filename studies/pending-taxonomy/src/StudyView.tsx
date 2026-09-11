import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./pending/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "While content is missing, what should occupy the screen?"
              : "内容还没到，屏幕上该留什么？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a loading state” describes the skin. The thing that breaks is occupancy: a skeleton that holds layout, an empty state that offers a next step, or a veil over an unknown shell — not a spinner, not a fake bar."
              : "「做个 loading」说的是外观。真正会坏掉的是占位：骨架占着布局，空状态给出下一步，壳未知时整页遮罩。不是转圈，也不是假进度条。"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {(locale === "en"
              ? ["Skeleton · holds seats", "Empty · one next step", "Veil · unknown shell"]
              : ["骨架屏 · 占着位子", "空状态 · 给出下一步", "整页遮罩 · 壳还未知"]
            ).map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the occupancy first. The three leaves below are live. None of them spin."
            : "先说占位。下面三片叶子可以点。三片都不转圈。"}
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
                {locale === "en" ? "1. A skeleton is not a looping spinner" : "1. 骨架不是转圈进度"}
              </span>
              <br />
              {locale === "en"
                ? "A skeleton holds layout until the real cards fade in. A spinner says work is happening and progress cannot be measured."
                : "骨架占着布局位子，真卡淡入。转圈说的是工作正在发生、进度还不能算。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. An empty state is not a notice" : "2. 空状态不是一条提示"}
              </span>
              <br />
              {locale === "en"
                ? "A notice reports something that already happened. An empty state occupies this region: why it is empty, and where to go next."
                : "提示报的是已经发生的消息。空状态占着这块区域：为什么空、下一步点哪里。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A page veil is not a skeleton" : "3. 整页遮罩不是骨架"}
              </span>
              <br />
              {locale === "en"
                ? "A skeleton reserves a known layout. Cover the page only while the shell itself is unknown. Do not draw a fake bar."
                : "骨架在结构已知时占位子。壳还没到、不知道会铺成什么样，才盖整页。不要画一条假进度。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            occupancy
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function occupancy(kind, state) {
  if (kind === "skeleton")
    return state === "ready" ? "content" : "skeleton"
  if (kind === "page")
    return state === "ready" ? "content" : "veil"
  return state === "ready" ? "content" : "empty"
}

allowsSpinner(kind) === false`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Skeleton holds the seat. Empty offers a next step. Veil covers an unknown shell. A spinner is progress, not occupancy. Shimmer is background-position; reduced motion leaves gray blocks. No fake bar on the veil."
              : "骨架占位子。空状态给下一步。遮罩盖未知的壳。转圈是进度，不是占位。扫光用背景位置；减少动效时留下灰块。遮罩上不要假条。"}
          </p>
        </article>
      </section>
    </div>
  );
}
