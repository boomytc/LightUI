import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./guides/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all teach. They do not appear, pin, or advance the same way."
              : "看起来都是新手引导，出现、钉住、推进的方式却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make an onboarding” describes the skin. The thing that breaks is when it appears, what it pins to, how they advance, and whether it still blocks after."
              : "「做个新手引导」说的是外观。真正会坏掉的是何时出现、钉在谁身上、靠什么推进、结束后还挡不挡。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name pin and advance. The six contrasts below are live."
            : "先说模型，再说场景，再说钉谁、怎么推进。下面六个对照可以点。"}
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
                {locale === "en" ? "1. A spotlight is not a confirm dialog" : "1. 聚光不是确认弹窗"}
              </span>
              <br />
              {locale === "en"
                ? "It blocks the outside so they must click that control. A confirm asks whether to do the task; there is no real button in its hole."
                : "聚光挡住外面，是为了逼人手点那个控件。确认弹窗问的是要不要做，挖孔里没有真实按钮。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A hotspot is not an unread badge" : "2. 热点不是未读角标"}
              </span>
              <br />
              {locale === "en"
                ? "A badge stacks a number. A hotspot teaches a new feature: open, read, the dot unloads."
                : "角标叠数字。热点教一个新功能：点开读完，圆点卸掉。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A hint is not a validation error" : "3. 空态提示不是校验报错"}
              </span>
              <br />
              {locale === "en"
                ? "A hint appears while the field is still empty and leaves when it is filled. Validation speaks after a wrong value."
                : "提示在字段还空着时出现，填上就走。校验是填错了才开口。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            guideAdvance
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function guideAdvance(kind) {
  if (kind === "tour") return "next"
  if (kind === "coach") return "confirm"
  if (kind === "hotspot") return "open-read"
  if (kind === "spotlight") return "click-target"
  if (kind === "checklist") return "task-complete"
  return "state-clear"
}

function guideBlocksOutside(kind) {
  return kind === "tour" || kind === "spotlight"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Only a tour allows Skip. Only a checklist stays after it is done. A spotlight has no Next."
              : "只有漫游允许跳过。只有清单在结束后还留着。聚光没有下一步。"}
          </p>
        </article>
      </section>
    </div>
  );
}
