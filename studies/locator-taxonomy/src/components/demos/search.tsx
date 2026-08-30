import { Search as SearchIcon, X } from "lucide-react";
import { useMemo, useState } from "react";
import { computeSearchScore, extractSearchTokens, type SearchableEntry } from "../../lib/machines";

const ENTRIES: SearchableEntry[] = [
  {
    id: "01",
    title: "设计令牌 (Design Tokens)",
    excerpt: "将颜色、字体字阶、间距与圆角收拢为全局语义变量，切换主题时无需逐项调整。",
    tags: ["基础", "Token", "变量"],
  },
  {
    id: "02",
    title: "组件状态矩阵 (State Matrix)",
    excerpt: "悬停、按下、加载、聚焦与错误状态统一评审，杜绝各页面自行填补异常态。",
    tags: ["状态", "组件规范"],
  },
  {
    id: "03",
    title: "长页面定位器 (Locator Taxonomy)",
    excerpt: "针对长单页迷失问题，按用户意图匹配阅读进度、返回顶部、锚点大纲与行内检索。",
    tags: ["定位", "导航", "长页面"],
  },
  {
    id: "04",
    title: "二次确认阶梯 (Confirmation Ladder)",
    excerpt: "危险操作拦截力度需与后果严重度严格匹配，提供撤销、长按、滑动、气泡与文本确认。",
    tags: ["安全", "二次确认", "交互"],
  },
  {
    id: "05",
    title: "表单按需披露 (Form Disclosure)",
    excerpt: "高频字段保持常驻，复杂参数随用户前置选择按需渐进展开，降低初始表单压力。",
    tags: ["表单", "渐进披露"],
  },
  {
    id: "06",
    title: "骨架屏与占位体验 (Skeleton Loading)",
    excerpt: "利用布局占位维持视口结构稳定性，避免异步数据到达时页面剧烈跳动。",
    tags: ["加载", "骨架屏", "CLS"],
  },
];

function highlightMatch(text: string, query: string) {
  const tokens = extractSearchTokens(query).filter((t) => t.length >= 2);
  const hit = tokens.find((t) => text.toLowerCase().includes(t));
  if (!hit) return text;
  const idx = text.toLowerCase().indexOf(hit);
  if (idx < 0) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent/20 px-0.5 text-fg font-semibold">
        {text.slice(idx, idx + hit.length)}
      </mark>
      {text.slice(idx + hit.length)}
    </>
  );
}

export function SearchDemo() {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    return ENTRIES.map((item) => ({ item, score: computeSearchScore(query, item) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }, [query]);

  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-fg">知识词条与模式库</h3>
          <p className="mt-0.5 text-xs text-fg-muted">输入关键词即时检索并高亮匹配项</p>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-fg-muted border border-border">
          {ENTRIES.length} 词条
        </span>
      </div>

      <div className="relative mt-4">
        <label className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
          <SearchIcon className="size-4 text-fg-subtle shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索模式名称、标签或正文描述..."
            className="w-full min-w-0 bg-transparent text-xs text-fg placeholder:text-fg-subtle outline-none"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-full p-1 text-fg-subtle hover:bg-surface-2 hover:text-fg transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-fg-subtle">
        <span>{searching ? "搜索命中结果" : "全部模式"}</span>
        <span className="font-mono">{searching ? `找到 ${results.length} 项` : "按序号排序"}</span>
      </div>

      {searching ? (
        <ul className="mt-3 space-y-2">
          {results.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-accent">{item.id}</span>
                <h4 className="text-sm font-medium text-fg">{highlightMatch(item.title, query)}</h4>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                {highlightMatch(item.excerpt, query)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-fg-subtle border border-border/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {ENTRIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setQuery(item.title.split(" ")[0])}
              className="rounded-xl border border-border bg-surface p-3 text-left shadow-sm hover:border-accent/40 transition-all"
            >
              <span className="font-mono text-xs font-semibold text-accent">{item.id}</span>
              <h4 className="mt-0.5 text-xs font-medium text-fg">{item.title}</h4>
              <p className="mt-1 line-clamp-2 text-[11px] text-fg-muted">{item.excerpt}</p>
            </button>
          ))}
        </div>
      )}

      {searching && results.length === 0 && (
        <div className="py-12 text-center text-xs text-fg-muted">
          未找到匹配的内容。试试输入「定位」、「安全」或「表单」。
        </div>
      )}
    </div>
  );
}
