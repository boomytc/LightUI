import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./drag/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all drag. They do not commit the same thing."
              : "看起来都是拖一下，松手交出去的却不是同一种结果。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make it draggable” describes the skin. The thing that breaks is the commit: a new order, a single receive, a cross-list transfer, or an invalid snap-back."
              : "「做个拖放」说的是外观。真正会坏掉的是提交：新顺序、一次接收、跨组转移，还是无效回弹。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the commit, name the scene, then name what drop writes. The four contrasts below are live."
            : "先说提交，再说场景，再说松手写什么。下面四个对照可以拖。"}
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
                {locale === "en" ? "1. A hole is not another commit" : "1. 占位洞不是另一种提交"}
              </span>
              <br />
              {locale === "en"
                ? "The gap hints where the insert will land. The commit is still a new order or a transfer."
                : "洞只提示将要插到哪。提交的仍是新顺序或跨组转移。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A snap-back is not a successful drop" : "2. 回弹不是成功投放"}
              </span>
              <br />
              {locale === "en"
                ? "It returns because the target is invalid. The data arrays must not change."
                : "动画回到原位，是因为目标无效。数据数组不能变。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Across lists is not a reorder" : "3. 跨列不是同列排序"}
              </span>
              <br />
              {locale === "en"
                ? "A transfer commits source, dest, and destIndex. The source does not collapse while dragging."
                : "跨组要交源列、目标列和下标。源列在拖的时候不塌，免得看起来已经交了。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            commitKind
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function commitKind(kind) {
  if (kind === "reorder") return "reorder"
  if (kind === "dropzone") return "receive"
  if (kind === "transfer") return "transfer"
  return "reject"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Insert on the vertical midline. Receive only inside the zone. Autoscroll is 64px of reorder, not a fifth kind."
              : "按垂直中线插。只有区内才接收。边缘 64px 自滚是排序里的行为，不是第五种。"}
          </p>
        </article>
      </section>
    </div>
  );
}
