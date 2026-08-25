import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./records/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does this batch replace the page, or append at the end?"
              : "这一批记录是整页替换，还是末尾追加？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make pagination” describes the skin. The thing that breaks is what happens to the old nodes: drop the previous page and return to the top, or grow visibleCount and keep what is already mounted."
              : "「做个分页」说的是外观。真正会坏掉的是旧节点怎么处置：丢掉上一页并回到顶部，还是增加 visibleCount、已经挂上的留下。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the batch, name the scene, then name drop and scroll. The two leaves below are live."
            : "先说这一批，再说场景，再说丢不丢、回不回顶。下面两片叶子可以点。"}
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
                {locale === "en" ? "1. Append is not infinite scroll" : "1. 追加不是无限滚动自动请求"}
              </span>
              <br />
              {locale === "en"
                ? "This leaf is a button. A click runs appendCount. Firing near the bottom is another question."
                : "本则是按钮追加。点一下才 appendCount。滚到附近就开火是另一件事。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Paging is not a carousel" : "2. 翻页不是轮播"}
              </span>
              <br />
              {locale === "en"
                ? "Previous / next cuts this page of records and drops the old page. A carousel loops posters on a track."
                : "上一页 / 下一页切的是这一页记录，旧页丢掉。走马灯是一组海报在轨道上循环。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A loaded prefix is not a skeleton" : "3. 已经到了一截不是骨架占位"}
              </span>
              <br />
              {locale === "en"
                ? "The prefix is real records. A skeleton holds seats that have not arrived. Load more is not work progress."
                : "前缀是真记录。骨架占的是还没到的位子。加载更多也不是工作进度。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            collectionView
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function collectionMode(kind) {
  return kind === "page" ? "replace" : "append"
}

function collectionView(kind, items, opts) {
  if (kind === "page") {
    return { shown: pageSlice(items, opts.page, opts.pageSize), scrollReset: true }
  }
  return { shown: items.slice(0, opts.visible), scrollReset: false }
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Page drops the last slice and resets scroll. Append grows visibleCount and keeps the prefix. Do not auto-add batch inside the view."
              : "翻页丢掉上一页并重置滚动。追加增加 visibleCount，前缀留下。不要在视图函数里自动加上 batch。"}
          </p>
        </article>
      </section>
    </div>
  );
}
