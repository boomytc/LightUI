import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./recall/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "After the flip, does this commit how well you remembered, or just the next card?"
              : "翻开之后提交的是记得程度，还是只是下一张？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Flip cards” describes the skin. The thing that breaks is the commit: a grade that schedules the next interval — not a swipe to the next frame, and not a confirm."
              : "「翻卡片」说的是外观。真正会坏掉的是提交：打分用来排下次间隔。不是滑走下一张，也不是确认弹窗。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the grade, name the scene, then name the rule. One deck below. The wrong move is a caption, not a second product."
            : "先说打分，再说场景，再说规则。下面一副牌。错的做法只写一句，不做成第二个产品。"}
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
                {locale === "en" ? "1. Recall is not a carousel" : "1. 复习不是轮播"}
              </span>
              <br />
              {locale === "en"
                ? "A carousel advances a frame. The flip is to compare; the three buttons commit how well you knew it."
                : "轮播切画面。这里翻面是为了对照，三个按钮提交的是记得程度。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. An empty pile is not a notice" : "2. 空牌不是一条提示"}
              </span>
              <br />
              {locale === "en"
                ? "A notice is a glance, then gone. Nothing due occupies this region: why it is empty, and one next step."
                : "提示瞄一眼就没了。今日无到期占着这块区域：为什么空、下一步点哪里。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A grade is not a confirm dialog" : "3. 打分不是确认弹窗"}
              </span>
              <br />
              {locale === "en"
                ? "Cancel / delete asks whether to destroy. Forgot / fuzzy / knew submit an interval. They are not “delete or not”."
                : "取消 / 删除问的是要不要毁掉。忘了 / 模糊 / 记得提交的是间隔，不是「要不要删」。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            recall
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function canGrade(face) {
  return face === "answer"
}

function applyGrade(card, grade, today) {
  if (grade === "again") {
    return { ...card, reviewCount: 0, nextReview: today }
  }
  if (grade === "hard") {
    return { ...card, nextReview: shiftISO(today, 1) }
  }
  const reviewCount = card.reviewCount + 1
  const days = intervalDays(reviewCount)
  return { ...card, reviewCount, nextReview: shiftISO(today, days) }
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Forgot requeues today and resets the count. Fuzzy keeps the count and waits one day. Knew steps 1, 3, 7, 14, 30."
              : "忘了排回今天并归零。模糊保留次数、明天再看。记得按 1、3、7、14、30 天走。"}
          </p>
        </article>
      </section>
    </div>
  );
}
