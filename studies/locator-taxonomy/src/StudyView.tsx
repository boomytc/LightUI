import { FORMULA, SCENES } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./components/playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "A longer page is only more scroll. First name the intent."
              : "页面变长只是滚动更多。先定意图，再给定位器。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Add a scrollbar” describes the overflow. What breaks is orientation: keep reading, jump a section, fold details, or search and slice — each job needs a different locator."
              : "「再加一点滚动」说的是溢出。真正会坏掉的是位置：连续阅读、结构跳转、折叠展开，还是行内检索筛选——意图不同，定位器就不同。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Four intents below. Pick the job first, then the model. The strip reports where you are while you move."
            : "下面先问四种意图，再选模型。顶上那条会跟着你的位置开口：完成度、阈值、当前节、步骤、命中或切片。"}
        </p>
      </section>

      <Playground />

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-2 border-b border-border bg-surface-2/70 px-4 py-2 text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          <span>{locale === "en" ? "Scene" : "场景"}</span>
          <span>{locale === "en" ? "Only scroll" : "一律长滚"}</span>
          <span>{locale === "en" ? "Match the intent" : "按意图匹配"}</span>
        </div>
        {SCENES.map((row) => (
          <div
            key={row.scene.zh}
            className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-2 border-b border-border px-4 py-2.5 last:border-b-0"
          >
            <p className="text-[13px] font-medium text-fg">{pick(row.scene, locale)}</p>
            <p className="text-[12px] text-fg-muted">{pick(row.naive, locale)}</p>
            <p className="text-[12px] text-fg">{pick(row.matched, locale)}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell locators apart" : "怎么把定位器与相近概念分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. In-page TOC is not site routing" : "1. 页面内大纲不是整站全局路由"}
              </span>
              <br />
              {locale === "en"
                ? "Outlines and scrollspy stay inside one document. Top bars and hamburger menus change the route."
                : "大纲与滚动高亮解决的是一篇里的段落直达；顶栏和汉堡解决的是跨路由的站点架构。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Reading progress is not a scrollbar" : "2. 阅读进度不是滚动条皮肤"}
              </span>
              <br />
              {locale === "en"
                ? "A scrollbar maps the viewport to a track. Progress reports remaining depth of the reading job."
                : "滚动条是视口在轨道上的物理映射；阅读进度报的是这篇还剩多深。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Outline anchors are not tabs" : "3. 大纲锚点不是页签切换"}
              </span>
              <br />
              {locale === "en"
                ? "Tabs replace the main view and cut context. Anchors keep the page and move you inside it."
                : "页签会切断上下文并换掉主视图；锚点保留整页，只把你送到那一节。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "4. A stepper is not field disclosure" : "4. 步骤向导不是表单字段披露"}
              </span>
              <br />
              {locale === "en"
                ? "A stepper is a staged machine with a forward lock. Field disclosure opens more on one page."
                : "向导是带阶段提交和顺序约束的状态机；字段披露是同一页里按需展开。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-fg bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
            calculateProgressRatio
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function calculateProgressRatio(top, height, view) {
  const max = height - view
  if (max <= 0) return 1
  return min(1, max(0, top / max))
}

function shouldShowBackToTop(top, threshold = 240) {
  return top > threshold
}

function canNavigateStep(target, current) {
  return target <= current
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Depth, threshold, and step lock stay in DOM-free helpers. The widget only reports what those functions already know."
              : "深度、阈值和步锁留在无 DOM 的纯函数里。界面只把这些函数已经知道的位置说出来。"}
          </p>
        </article>
      </section>
    </div>
  );
}
