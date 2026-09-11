import { Search as SearchIcon, X } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { computeSearchScore, extractSearchTokens, type SearchableEntry } from "../../lib/machines";
import { useDebounced } from "../../lib/use-debounced";

const ENTRIES: SearchableEntry[] = [
  {
    id: "01",
    title: "设计令牌 (Design Tokens)",
    excerpt: "将颜色、字阶、间距与圆角收拢为语义变量，换主题时不必逐项改。",
    tags: ["基础", "Token", "变量"],
  },
  {
    id: "02",
    title: "组件状态矩阵 (State Matrix)",
    excerpt: "悬停、按下、加载、聚焦与错误一次审完，避免各页自己补异常态。",
    tags: ["状态", "组件规范"],
  },
  {
    id: "03",
    title: "长页面定位器 (Locator Taxonomy)",
    excerpt: "针对长单页迷失，按意图匹配阅读进度、返回顶部、锚点大纲与行内检索。",
    tags: ["定位", "导航", "长页面"],
  },
  {
    id: "04",
    title: "二次确认阶梯 (Confirmation Ladder)",
    excerpt: "危险操作的拦截力度跟后果匹配：撤销、长按、对话框、打字确认。",
    tags: ["安全", "二次确认", "交互"],
  },
  {
    id: "05",
    title: "表单按需披露 (Form Disclosure)",
    excerpt: "高频字段常驻，复杂参数随前置选择展开，降低首屏表单压力。",
    tags: ["表单", "渐进披露"],
  },
  {
    id: "06",
    title: "骨架屏与占位 (Skeleton Loading)",
    excerpt: "用布局占位稳住视口，避免异步到达时整页跳动。",
    tags: ["加载", "骨架屏", "CLS"],
  },
];

const SUGGESTIONS = ["定位", "设计", "表单", "安全"];

function highlightMatch(text: string, query: string) {
  const tokens = extractSearchTokens(query).filter((token) => token.length >= 2);
  const hit = tokens.find((token) => text.toLowerCase().includes(token));
  if (!hit) return text;
  const idx = text.toLowerCase().indexOf(hit);
  if (idx < 0) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent/20 px-0.5 font-semibold text-fg">
        {text.slice(idx, idx + hit.length)}
      </mark>
      {text.slice(idx + hit.length)}
    </>
  );
}

export function SearchDemo() {
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const [query, setQuery] = useState("");
  const deferred = useDebounced(query, 160);
  const searching = deferred.trim().length > 0;

  const results = useMemo(() => {
    return ENTRIES.map((item) => ({ item, score: computeSearchScore(deferred, item) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.item);
  }, [deferred]);

  useLayoutEffect(() => {
    report({
      metric: t("检索命中", "Search hits"),
      value: searching
        ? t(`${results.length} 条`, `${results.length} hits`)
        : t(`全部 ${ENTRIES.length} 条`, `All ${ENTRIES.length}`),
      hint: searching
        ? query !== deferred
          ? t("正在匹配", "Matching")
          : results.length === 0
            ? t("无结果，换一个词", "No hits — try another word")
            : t(`查询「${deferred}」`, `Query “${deferred}”`)
        : t("空查询回到默认列表", "Empty query restores the list"),
      ratio: searching ? results.length / ENTRIES.length : 1,
    });
  }, [deferred, query, report, results.length, searching, t]);

  return (
    <div data-scroller="locator" className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-fg">知识词条</h3>
          <p className="mt-1 text-[12px] text-fg-muted">有关键词就直接搜。标题比标签和正文更重。</p>
        </div>
        <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-fg-muted">
          {ENTRIES.length}
        </span>
      </div>

      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3 shadow-sm transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-ring">
        <SearchIcon className="size-4 shrink-0 text-fg-subtle" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索名称、标签或正文"
          className="w-full min-w-0 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
        />
        {query.length > 0 && (
          <button
            type="button"
            aria-label="清除检索"
            onClick={() => setQuery("")}
            className="rounded-full p-1 text-fg-subtle hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-3.5" />
          </button>
        )}
      </label>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => setQuery(word)}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted hover:border-border-strong hover:text-fg"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-fg-subtle">
        <span>{searching ? "命中结果" : "全部词条"}</span>
        <span className="font-mono" aria-live="polite">
          {searching ? `${results.length} 项` : "按序号"}
        </span>
      </div>

      {searching ? (
        results.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {results.map((item) => (
              <li key={item.id} className="locator-in rounded-xl border border-border bg-surface p-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-accent">{item.id}</span>
                  <h4 className="text-sm font-medium text-fg">{highlightMatch(item.title, deferred)}</h4>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                  {highlightMatch(item.excerpt, deferred)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border/60 bg-surface-2 px-1.5 py-0.5 text-[10px] text-fg-subtle"
                    >
                      {highlightMatch(tag, deferred)}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-[13px] font-medium text-fg">没有与「{deferred}」匹配的词条</p>
            <p className="mt-1 text-[12px] text-fg-muted">试试 定位、表单 或 安全。</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 inline-flex min-h-9 items-center rounded-full bg-fg px-3 text-[12px] font-medium text-surface"
            >
              回到全部词条
            </button>
          </div>
        )
      ) : (
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {ENTRIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setQuery(item.title.split(" ")[0])}
              className="rounded-xl border border-border bg-surface p-3 text-left shadow-sm transition-colors hover:border-border-strong"
            >
              <span className="font-mono text-xs font-semibold text-accent">{item.id}</span>
              <h4 className="mt-0.5 text-[13px] font-medium text-fg">{item.title}</h4>
              <p className="mt-1 line-clamp-2 text-[11px] text-fg-muted">{item.excerpt}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
