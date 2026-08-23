import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./buttons/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all click. They do not weigh the same."
              : "看起来都能点，重量却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a button” describes the skin. The thing that breaks is weight: one filled primary, a stroke that does not compete, or text with no chrome."
              : "「做个按钮」说的是外观。真正会坏掉的是重量：一个面状主操作、不抢戏的线状，还是没有铬的文字。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the weight, name the scene, then name the chrome. The three contrasts below are live. The card always keeps the trio."
            : "先说重量，再说场景，再说有没有铬。下面三个对照可以点。卡片始终是那三个一起。"}
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
                {locale === "en" ? "1. Button weight is not fill versus pick" : "1. 按钮重量不是填还是选"}
              </span>
              <br />
              {locale === "en"
                ? "One line or a paragraph, radios or a short list — that is the field’s machine. This study asks how heavy the click is."
                : "一行或一段、可见单选或短列表，是格子的机型。这一则问的是这一击有多重。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "2. The primary is not the only action in a dialog"
                  : "2. 主按钮不是弹窗里的唯一动作"}
              </span>
              <br />
              {locale === "en"
                ? "Overlay asks whether the layer interrupts. A dialog can still hold confirm (solid) and cancel (outline). Interrupt does not mean a single button."
                : "弹窗谈的是打不打断。窗里仍可有确认（面状）和取消（线状）。打断不等于只留一个按钮。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A text button is not link navigation" : "3. 文字按钮不是链接导航"}
              </span>
              <br />
              {locale === "en"
                ? "A text button is a weak action on this page. Going somewhere else is nav."
                : "文字按钮仍是这一页的弱动作。去别的页是导航。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            weight
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function weight(kind) {
  if (kind === "solid") return "primary"
  if (kind === "outline") return "secondary"
  return "tertiary"
}

function tooManyPrimaries(count) {
  return count > 1
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Only solid is filled. A region may have one primary. Radius can change inside the same weight; a second fill cannot."
              : "只有面状是填充的。一区只能有一个主按钮。同一重量里圆角可变，但不能再放第二个实心。"}
          </p>
        </article>
      </section>
    </div>
  );
}
