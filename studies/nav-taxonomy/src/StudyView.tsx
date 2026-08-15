import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./navs/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
            Placement · Reveal · Scroll
          </p>
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg break-keep sm:text-[2.6rem]">
            {locale === "en"
              ? "They are all “the nav.” They do not live, open, or scroll the same way."
              : "看起来都是导航，住在哪、怎么开、滚的时候干什么却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a navbar” describes a row of links. The thing that breaks is the model: where it sits, how it opens, and what scroll changes."
              : "「做个导航栏」说的是一排链接。真正会坏掉的是模型：放在哪、怎么打开、滚的时候钉住、高亮还是变矮。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name placement, reveal, and scroll. The nine fixtures below are the same contrast, live."
            : "先说模型，再说场景，再说放在哪、怎么开、滚的时候变什么。下面九个 fixture 是同一组对照，可以点。"}
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

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <article>
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Is it the primary nav?" : "1. 它是不是主导航"}
              </span>
              <br />
              {locale === "en"
                ? "A breadcrumb is a path under the primary. Treating it as the menu leaves a deep page with no way out."
                : "面包屑是主导航下面的路径。把它当成主菜单，深层页就没有别的出口。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Occupy, overlay, or follow scroll?" : "2. 占位、盖上来，还是跟着滚"}
              </span>
              <br />
              {locale === "en"
                ? "A sidebar occupies. A drawer overlays an edge. Overlay replaces the page. Spy highlights. Shrink changes the bar itself."
                : "侧栏占位。抽屉从一条边盖上来。全屏把页面换成菜单。锚点跟着高亮。收缩改的是顶栏自己。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Three pairs people mix up" : "3. 最容易混的三对"}
              </span>
              <br />
              {locale === "en"
                ? "A drawer is not a full-screen overlay. A dropdown is not a mega menu. Shrink is not a floating sticky."
                : "抽屉不是全屏。下拉不是巨型菜单。收缩不是悬浮吸顶。"}
            </li>
          </ol>
        </article>

        <article className="rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">nextShrunk</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function nextShrunk(prev, y) {
  return prev ? y > 16 : y > 40
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Two thresholds, not one. Enter at 40, leave at 16, so a small bounce does not flicker the bar."
              : "两道阈值，不是一道。进入 40、退出 16，轻微回弹才不会让顶栏闪。"}
          </p>
        </article>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-[1.2rem] font-semibold tracking-tight">
          {locale === "en" ? "Not a commit rule, not occupancy, not a corridor" : "这不是提交规则，也不是占位，也不是走廊"}
        </h2>
        <div className="mt-5 grid gap-6 text-[14px] leading-relaxed text-fg-muted md:grid-cols-2">
          <p>
            {locale === "en"
              ? "Name the dropdown answers what a downward panel commits. Name the sidebar answers whether a left rail occupies. Menu intent answers a later hover question. This page is earlier — where this thing called “the nav” lives."
              : "给下拉起对名字回答的是往下展开的面板提交什么。给侧栏起对名字回答的是靠左那一块占不占位。菜单意图预测回答的是后一步 hover。本页更早——这块叫「导航」的东西到底住在哪。"}
          </p>
          <p>
            {locale === "en"
              ? "The dropdown and mega fixtures here are site sections. If they became hover-tracking, that other study’s corridor applies. The sidebar fixture only says vertical is a kind of primary nav."
              : "这里的下拉和巨型是站点栏目。若改成 hover 跟手，才用得上那则 study 的走廊。这里的侧栏只说明竖排是一种主导航。"}
          </p>
        </div>
      </section>
    </div>
  );
}
