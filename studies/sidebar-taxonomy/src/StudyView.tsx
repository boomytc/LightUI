import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./rails/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
            Space model · Rail taxonomy
          </p>
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg break-keep sm:text-[2.6rem]">
            {locale === "en"
              ? "They all sit on the left. They do not give space back the same way."
              : "看起来都贴在左边，空间怎么让路却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a sidebar” describes placement. The thing that breaks is occupancy: occupy or overlay, grow or slide, a tree or a selector."
              : "「做个侧边栏」说的是位置。真正会坏掉的是空间模型：占位还是盖上来，变宽还是滑入，目录树还是选择器。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name whether expand changes width or layer. The five fixtures below are the same contrast, live."
            : "先说模型，再说场景，再说展开改的是宽度还是图层。下面五个 fixture 是同一组对照，可以点。"}
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
                {locale === "en" ? "1. Does it occupy by default?" : "1. 默认占不占位"}
              </span>
              <br />
              {locale === "en"
                ? "Island, wheel, tree, and collapse all take a column. Off-canvas has zero width until asked."
                : "悬浮岛、滚轮、多级、可折叠都占一栏。隐藏式没被叫出来之前，宽度为零。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. What does expand change?" : "2. 展开改的是什么"}
              </span>
              <br />
              {locale === "en"
                ? "Collapse changes width; the main view grows. Off-canvas changes layer; the text stays put under a slide-in."
                : "可折叠改宽度，主区跟着伸。隐藏式改图层，正文不动，目录盖上来。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Two pairs people mix up" : "3. 最容易混的两对"}
              </span>
              <br />
              {locale === "en"
                ? "Collapsed is still a rail — not off-canvas. A parent files the list — it is not a wheel selector."
                : "折叠后仍占一条图标栏，不是隐藏式。父级只归类，不是滚轮那种选择器。"}
            </li>
          </ol>
        </article>

        <article className="rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">occupyPx</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function occupyPx(kind, expanded) {
  if (kind === "offcanvas") return 0
  if (kind === "collapsible") return expanded ? 240 : 72
  return kind === "floating" ? 216 : 208
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Occupancy is the width taken from the main flow. An overlay panel can be 256px wide and still occupy zero."
              : "占位是从主区流里拿走的宽度。覆盖层可以宽 256px，占位仍是零。"}
          </p>
        </article>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-[1.2rem] font-semibold tracking-tight">
          {locale === "en" ? "Not a dropdown, not a safe triangle" : "这不是下拉，也不是安全三角"}
        </h2>
        <div className="mt-5 grid gap-6 text-[14px] leading-relaxed text-fg-muted md:grid-cols-2">
          <p>
            {locale === "en"
              ? "Name the dropdown answers what a downward panel commits. Menu intent answers a later hover question. This page is earlier — whether this left-hand thing occupies space, and how it yields."
              : "给下拉起对名字回答的是往下展开的面板提交什么。菜单意图预测回答的是后一步 hover。本页更早——这块靠左的东西到底占不占位、怎么让路。"}
          </p>
          <p>
            {locale === "en"
              ? "The multi-level fixture here is click-to-accordion. If it became hover-tracking, that other study’s corridor applies."
              : "这里的多级是点击手风琴。若改成 hover 跟手，才用得上那则 study 的走廊。"}
          </p>
        </div>
      </section>
    </div>
  );
}
