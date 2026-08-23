import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./overlays/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all float. They do not interrupt the same way."
              : "看起来都是浮层，打断程度却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a dialog” describes the skin. The thing that breaks is interrupt versus attach: a blocking confirm, a weak side editor, or a few actions stuck to the trigger."
              : "「做个弹窗」说的是外观。真正会坏掉的是打不打断、贴不贴触发点：必须先处理、弱打断的侧栏编辑，还是贴着按钮的几项动作。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the model, name the scene, then name interrupt and anchor. The three contrasts below are live."
            : "先说模型，再说场景，再说打不打断、贴不贴。下面三个对照可以点。"}
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
                {locale === "en" ? "1. A content drawer is not a hamburger" : "1. 内容抽屉不是汉堡主导航"}
              </span>
              <br />
              {locale === "en"
                ? "The drawer edits this page from the right; the list stays. A hamburger pulls site destinations in from the edge."
                : "抽屉是这一页的编辑表单，从右侧来，底下列表还在。汉堡才是把整站栏目从边缘拉出来。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A right drawer is not an off-canvas rail" : "2. 右侧抽屉不是隐藏式侧栏"}
              </span>
              <br />
              {locale === "en"
                ? "The drawer covers the current task and goes away. An off-canvas rail is about occupancy: whether the main column yields."
                : "抽屉盖在当前任务上，用完就关。隐藏式侧栏谈的是占不占位、主区怎么让路。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A popover is not a dropdown commit" : "3. 气泡不是下拉提交"}
              </span>
              <br />
              {locale === "en"
                ? "A popover is a few actions stuck to the trigger. A dropdown opens downward and commits a value. Delete in the menu opens a modal. A notice does not block the task."
                : "气泡是贴着触发点的几项动作。下拉才是往下展开、点中交一个值。菜单里的删除再唤起弹窗。提示不挡住当前任务。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            interruptKind
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function interruptKind(kind) {
  if (kind === "modal") return "block"
  if (kind === "drawer") return "weak"
  return "none"
}

function backdropDismiss(kind, dangerous) {
  if (kind === "modal") return !dangerous
  return kind === "drawer"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "A dangerous modal does not close on the scrim. Only a popover sticks to the trigger. More than seven items is too many for a popover."
              : "危险弹窗点遮罩关不掉。只有气泡贴着触发点。超过七项就不是气泡。"}
          </p>
        </article>
      </section>
    </div>
  );
}
