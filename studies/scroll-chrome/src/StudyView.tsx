import { Playground } from "./chrome/Playground";
import { buildSnippet } from "./lib/machines";
import { useLocale } from "./lib/site-locale";

export function StudyView() {
  const locale = useLocale();
  const snippet = buildSnippet();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Is this a start cue, or a position track?"
              : "滚动提示是开场邀请，还是位置轨道？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a cooler scrollbar” describes the skin. What breaks is the job: still at the top, invite the next screen; already moving, report where you are — as a fraction, not a heading."
              : "「做个更酷的滚动条」说的是外观。真正会坏掉的是职责：还在顶上，请人往下一屏；已经在滚，报现在在哪——报的是比例，不是章节。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Three leaves below. Native keeps the OS thumb. Cue unloads after the first screen. Track binds to this viewport."
            : "下面三片叶子。系统条留下拇指。邀请离开顶上就卸。轨道绑在这一格视口上。"}
        </p>
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
                {locale === "en" ? "1. A document fraction is not work progress" : "1. 文档比例不是工作进度"}
              </span>
              <br />
              {locale === "en"
                ? "Progress asks whether work can be counted to 100. Scroll chrome asks what overflow reports."
                : "进度问工作能不能数到 100。滚动铬问溢出报什么。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Dots are not section anchors" : "2. 点列不是章节锚点"}
              </span>
              <br />
              {locale === "en"
                ? "A click seeks i/(n−1) of this pane. Highlighting the heading in view is nav scrollspy."
                : "点一下跳的是这一格的 i/(n−1)。高亮当前标题是导航的锚点。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Do not stitch cue and track" : "3. 不要把邀请和轨道缝在一起"}
              </span>
              <br />
              {locale === "en"
                ? "An arrow that morphs into a rail after the first pixel makes two jobs share one widget."
                : "滚出第一像素就把箭头变成轨道，是两种任务抢同一根条。"}
            </li>
          </ol>
        </article>
        <article className="min-w-0 overflow-hidden rounded-2xl border border-fg bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">scroll-chrome</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">{snippet}</pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Bind the track to the overflowing cell. Hidden when it fits. Reduced motion snaps extensions and skips the bob."
              : "轨道绑在溢出的那一格。装得下就 hidden。降动效时伸长一次到位，箭头不晃。"}
          </p>
        </article>
      </section>
    </div>
  );
}
