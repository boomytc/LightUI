import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./heroes/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all have a big picture. They do not answer the same first glance."
              : "看起来都是大图，第一眼要回答的事却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a fancy hero” describes the skin. The thing that breaks is the first-fold job: what it solves, who you are, why now, what is for sale, what happened, what you will learn, what it can do, or who is here."
              : "「做个高级首屏」说的是外观。真正会坏掉的是第一屏的任务：能解决什么、你是谁、为什么现在、卖什么、发生了什么、能学到什么、能帮我做什么，还是谁在这里。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the job, name the scene, then name the one primary. The eight contrasts below are live."
            : "先说第一眼回答什么，再说场景，再说唯一主行动。下面八个对照可以点。"}
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
                {locale === "en"
                  ? "1. A landing skeleton is not what the first glance answers"
                  : "1. 落地骨架、全屏占满，都不是第一眼回答什么"}
              </span>
              <br />
              {locale === "en"
                ? "How a landing is banded, and whether this fold fills the viewport, is the page skeleton. This study asks which question the un-scrolled glance must confirm."
                : "落地页怎么铺、这一折占不占满视口，是整页骨架。这一则问的是不滚动的那一眼要确认哪件事。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. The first fold is not a login card" : "2. 首屏不是登录卡"}
              </span>
              <br />
              {locale === "en"
                ? "A login card asks who you are and whether you may enter. The first fold answers what the person who opened this page cares about right now."
                : "登录卡在问你是谁、能不能进。第一屏在回答打开这一页的人此刻最关心的问题。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. A shop is not five posters; a course is not a syllabus"
                  : "3. 电商不是五张海报，课程不是大纲"}
              </span>
              <br />
              {locale === "en"
                ? "Commerce features one product. A course promises the work, then offers the outline. A community shows people and topics, not a product pitch."
                : "店要卖一件主推。课要先承诺作品，再给大纲入口。社区给人与话题，不卖平台。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            questionOf
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function questionOf(kind) {
  return QUESTIONS[kind]
}

function primaryCtaCount(kind) {
  return 1
}

function allowsCarousel(kind) {
  return kind === "portfolio"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Each leaf has a different first-glance question. The primary is always one. A shop must not rotate posters; tooManyBanners is true when commerce has more than one."
              : "每种叶子第一眼的问题不同。主行动永远是一个。电商不能轮播海报；海报多于一张，tooManyBanners 为真。"}
          </p>
        </article>
      </section>
    </div>
  );
}
