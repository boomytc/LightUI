import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./slides/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <header className="flex flex-col gap-2 pb-6 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <h1 className="max-w-2xl text-[1.45rem] font-semibold leading-[1.2] tracking-tight text-fg sm:text-[1.75rem]">
          {locale === "en"
            ? "They all change the frame. They do not advance the same way."
            : "看起来都会换画面，切法却完全不同。"}
        </h1>
        <p className="max-w-md text-[13px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Name the cut first. The eight motions below are live — the stage is the page."
            : "先给切法起名。下面八种运动是活的——舞台就是这一页。"}
        </p>
      </header>

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
