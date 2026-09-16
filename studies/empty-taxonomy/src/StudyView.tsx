import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./empty/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Why is this blank — create, revise, loosen, retry, or only celebrate?"
              : "空白为什么空，该给入口、改关键词、改条件、重试，还是只给完成反馈？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make an empty state” describes the skin. What breaks is the same nudge for different causes: create gets an entry, search revises the query, filters loosen, failure retries and keeps the list, done only celebrates."
              : "「做个空状态」说的是外观。真正会坏掉的是空因不同、却用同一种催促：创建给入口，搜索改关键词，筛选改条件，失败可重试并保留原列表，完成给反馈不要再催。"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {(locale === "en"
              ? [
                  "First-use · add the first",
                  "Search · revise the query",
                  "Filter · drop a chip",
                  "Error · keep the list",
                  "Done · no nag",
                ]
              : [
                  "首次使用 · 添加第一位",
                  "搜索无果 · 改关键词",
                  "筛选无果 · 去掉条件",
                  "加载失败 · 保留列表",
                  "全部完成 · 不再催",
                ]
            ).map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the cause first. The five leaves below are live. Only first-use gets a primary create."
            : "先说空因。下面五片叶子可以点。只有首次使用才给创建主按钮。"}
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
                  ? "1. Why it is empty is not what occupies the screen"
                  : "1. 为什么空不是屏幕上该留什么"}
              </span>
              <br />
              {locale === "en"
                ? "A skeleton holds layout, an empty state offers a next step, a veil covers an unknown shell. This study asks the cause once it is already empty."
                : "骨架占布局，空状态给出下一步，整页遮罩盖未知的壳。这一则问的是已经空了之后，空因是什么。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "2. A miss is not “no data”"
                  : "2. 没匹配不是没数据"}
              </span>
              <br />
              {locale === "en"
                ? "Search keeps the last keyword. Filters keep the chips. A create primary belongs in the first-use well, not in a miss. Chrome Add may stay — the library is still there."
                : "搜索保留刚才的词。筛选留下标签。创建主按钮只给还没开始的空井；顶栏添加说明库还在。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. Failure keeps the list; done does not nag"
                  : "3. 失败保留列表，完成不再催"}
              </span>
              <br />
              {locale === "en"
                ? "A hung refresh is not empty. A cleared inbox is good news. Neither should become “no data + a button”."
                : "刷新挂了不是空。待办清零是好消息。两样都不要做成「暂无数据 + 一个按钮」。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
            emptyCause
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`if (loadStatus === "error") return "error"
if (records === 0) return "first-use"
if (query && visible === 0) return "search"
if (filters && visible === 0) return "filter"
if (pending === 0 && history > 0) return "done"

showsPrimaryCta(cause)
  === (cause === "first-use")`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Error beats empty. Search beats filter. Done needs history. Only first-use gets a primary create."
              : "失败优先于空。搜索优先于筛选。完成要求历史还在。只有首次使用才给创建主按钮。"}
          </p>
        </article>
      </section>
    </div>
  );
}
