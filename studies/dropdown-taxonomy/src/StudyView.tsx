import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./overlays/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
            Commit model · Overlay taxonomy
          </p>
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg break-keep sm:text-[2.6rem]">
            {locale === "en"
              ? "They all open downward. They do not commit the same thing."
              : "看起来都是往下展开，用途却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a dropdown” describes the skin. The thing that breaks is the commit rule: one value, a set, a path, an action, or a span of days."
              : "「做个下拉」说的是外观。真正会坏掉的是提交规则：一个值、一组、一条路径、一次动作，还是一段日期。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name when the panel closes. The seven fixtures below are the same contrast, live."
            : "先说模型，再说场景，再说面板何时关闭。下面七个 fixture 是同一组对照，可以点。"}
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
                {locale === "en" ? "1. What is committed?" : "1. 提交的是什么"}
              </span>
              <br />
              {locale === "en"
                ? "A flat value, a set of chips, a path to a leaf, an immediate action, a navigation hop, or two dates."
                : "一个扁平值、一组标签、一条到叶子的路径、一次立刻执行的动作、一次导航，还是两端日期。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. When does the panel close?" : "2. 面板何时关闭"}
              </span>
              <br />
              {locale === "en"
                ? "Select and grouped close on pick. Multi stays open. Cascader closes on a leaf. Split only opens from the chevron. Mega is not a field."
                : "Select / Grouped 点中即关。Multi 保持开着。Cascader 点到叶子才关。Split 只有箭头打开菜单。Mega 不是表单。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Grouped is not Cascader" : "3. Grouped 不是 Cascader"}
              </span>
              <br />
              {locale === "en"
                ? "A group title files the list. A parent region only expands. Committing “Zhejiang” is the wrong machine."
                : "分组标题只整理列表。父级行政区只展开。把「浙江省」当成最终值，是用错了机器。"}
            </li>
          </ol>
        </article>

        <article className="rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            pickCascade
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function pickCascade(tree, draft, level, id) {
  const next = [...draft.slice(0, level), id]
  const node = nodeAt(tree, next)
  if (node.children) return { draft: next }
  return { draft: next, committed: next, close: true }
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Parents rewrite the draft and grow a column. Only a leaf writes the committed path. Multi-select is the opposite stay-open rule: toggle, don’t close."
              : "父级只改 draft、加一列。只有叶子才写入 committed。Multi-select 是相反的规则：切换，但不关。"}
          </p>
        </article>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-[1.2rem] font-semibold tracking-tight">
          {locale === "en" ? "Not the same problem as a safe triangle" : "这不是安全三角那件事"}
        </h2>
        <div className="mt-5 grid gap-6 text-[14px] leading-relaxed text-fg-muted md:grid-cols-2">
          <p>
            {locale === "en"
              ? "Menu intent answers a later question: once you already have a hover cascade, a diagonal must not steal the submenu. This page is the earlier question — which machine is this downward panel."
              : "菜单意图预测回答的是后一步：已经决定用 hover 多级菜单之后，斜向穿越不该误切换。本页是更早一步——这块往下展开的东西到底是哪一种机器。"}
          </p>
          <p>
            {locale === "en"
              ? "The Cascader here is click-to-expand. The Mega Menu is click-to-toggle. Neither tracks the pointer. If they became hover-tracking, that other study’s corridor applies."
              : "这里的 Cascader 是点选列，Mega Menu 是点击展开，都不跟手。若改成 hover 跟手，才用得上那则 study 的走廊。"}
          </p>
        </div>
      </section>
    </div>
  );
}
