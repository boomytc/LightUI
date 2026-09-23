import { Playground } from "./table/Playground";
import { useLocale } from "./lib/site-locale";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Where do find, see, and act live on a record table?"
              : "找、看、改，分别落在记录表的哪一层？"}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a table” describes the fields. What breaks is a grid with nowhere to filter, a header that scrolls away, and every action painted on the row. Filter from the column. Keep the header in the table’s scrollport. Show one action until a selection asks for the bulk bar."
              : "「做一个表格」说的是字段。真正会坏掉的是格子上没有地方筛、表头跟着滚走、每一行把动作铺开。筛从这一列的表头来。表头留在表自己的滚动区。一行先露出一个动作，有勾选，批量条才换掉搜索。"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {(locale === "en"
              ? ["Find · header and chips", "See · sort, sticky header, columns", "Act · one row action, then bulk"]
              : ["找 · 表头和已选条件", "看 · 排序、固定表头、列", "改 · 一行一个动作，再批量"]
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
            ? "The seven leaves below are one table. Keys 1–7 jump. Click a leaf and the table shows that layer. Sorting does not drop rows. Clear filters leaves the name search."
            : "下面七片叶子是同一张表。数字键 1–7 可以跳。点一片，表就落到那一层。排序不减少条数。清空筛选会留下名称搜索。"}
        </p>
      </section>

      <Playground />

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How the layers stay apart" : "这三层怎么分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Find lives on the column" : "1. 找在这一列上"}
              </span>
              <br />
              {locale === "en"
                ? "A tag filter opens from the tag header. Checks wait in a draft. Applied values sit above the table, one chip each. The name search is a query, not a chip."
                : "标签从标签表头打开。勾选先留在草稿。应用之后，每个值在表上方一枚。名称搜索是查询，不是一枚条件。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. See keeps the header with the rows" : "2. 看的时候表头还在"}
              </span>
              <br />
              {locale === "en"
                ? "Amount cycles high-to-low, then low-to-high, then back. The count stays. The header sticks inside this scrollport. The name column cannot be turned off."
                : "金额先从高到低，再从低到高，然后回到原序。条数不变。表头钉在这个滚动区里。名称列不能关。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Act waits for a count" : "3. 改要等一个数量"}
              </span>
              <br />
              {locale === "en"
                ? "View stays on the row. Edit, duplicate, and delete are in More. The bulk bar replaces search only after the selection count is above zero, and select-all checks the rows the filter is showing."
                : "查看留在行上。编辑、复制、删除在更多里。已选数量大于 0，批量条才换掉搜索。全选只勾当前筛出来的行。"}
            </li>
          </ol>
        </article>
        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
            tableLayers
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`find  → header facet + chips
see   → sort, sticky header, columns
act   → view on the row, bulk after a count

OR inside a facet, AND across
sort cycle: none → desc → asc
select-all = rows in view
clear filters keeps the name query`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "A filtered view keeps the records. Paging drops the previous page. A row here is one follow-up, not a metric to drill."
              : "筛选留下的是当前视图，记录还在。翻页会丢掉上一页。这里的一行是一条跟进，不是一个往下钻的指标。"}
          </p>
        </article>
      </section>
    </div>
  );
}
