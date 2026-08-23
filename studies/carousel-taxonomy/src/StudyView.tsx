import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./slides/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all change the frame. They do not advance the same way."
              : "看起来都会换画面，切法却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a banner” describes the skin. The thing that breaks is the cut: a slide, a fade, a coverflow, a stack, a page turn, an accordion, a 360, or parallax."
              : "「做个 Banner」说的是外观。真正会坏掉的是切法：平移、淡入、木马、叠卡、翻页、手风琴、360，还是视差。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name what the motion commits. The eight contrasts below are live."
            : "先说模型，再说场景，再说运动提交的是什么。下面八个对照可以点。"}
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
                {locale === "en" ? "1. Advancing frames is not a notice marquee" : "1. 切画面不是通知跑马灯"}
              </span>
              <br />
              {locale === "en"
                ? "A carousel takes the whole view away. A marquee rotates copy in one strip under the header and pauses on hover."
                : "轮播把整块画面切走。跑马灯在页头下方同一条里滚字，悬停暂停。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A carousel is not masonry" : "2. 轮播不是瀑布布局"}
              </span>
              <br />
              {locale === "en"
                ? "Masonry shows many blocks at once. A carousel is how a set of frames advances — one cut at a time."
                : "瀑布是同时看见多块。轮播是一组画面怎么前进，一次切一刀。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. List pagination is not a marquee" : "3. 列表翻页不是走马灯"}
              </span>
              <br />
              {locale === "en"
                ? "Previous / next on a table commits a page of rows. That is paging, not a loop of posters. Do not open it as a ninth kind."
                : "表格的上一页 / 下一页切的是一页记录。那是分页，不是海报循环。不要单开成第九种轮播。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            shouldAutoplay
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function stepIndex(i, dir, length) {
  return ((i + dir) % length + length) % length
}

function shouldAutoplay(hovering, reduced) {
  return !hovering && !reduced
}

function fadeUsesOpacityOnly() {
  return true
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Classic wraps. Hover or reduced motion kills autoplay. Fade is opacity only — no layout jump. Spin rotates a product, not a slide list."
              : "经典默认 wrap。悬停或减少动效关掉自动播放。淡入只改透明度，布局不跳。360 转的是产品，不是幻灯片。"}
          </p>
        </article>
      </section>
    </div>
  );
}
