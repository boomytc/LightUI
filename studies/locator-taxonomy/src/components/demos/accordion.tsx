import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { cn } from "../../lib/utils";

const FAQS = [
  {
    q: "如何建立不会让人迷路的长页面？",
    a: "先按意图分类：连续阅读用进度与回顶；结构检索用侧边大纲；复杂表单用步骤向导；低频说明用折叠；精准查找用行内检索。",
    tags: ["信息架构", "意图"],
  },
  {
    q: "哪些内容适合默认折叠收拢？",
    a: "低频参数、进阶配置、FAQ 与排障细节。标题必须先在，供扫读；答案只在点击时展开，避免一次冲淡主干。",
    tags: ["渐进披露"],
  },
  {
    q: "折叠面板的高度过渡该怎么做？",
    a: "用 grid-template-rows: 0fr / 1fr。比起用脚本量 scrollHeight，网格行能跟着内容变，且少一次重排抖动。",
    tags: ["CSS Grid"],
  },
  {
    q: "页面结构调整时，旧锚点会失效吗？",
    a: "尽量保留旧锚点 ID，并给失效地址一条平滑去向，避免收藏或分享的 hash 落到空白。",
    tags: ["锚点", "URL"],
  },
  {
    q: "窄屏上大纲怎么放？",
    a: "不要硬挤双栏。收成顶部横滑药丸或抽屉，触控热区至少 44px。大纲仍是页内跳转，不是站点导航。",
    tags: ["窄屏"],
  },
];

export function AccordionDemo() {
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const [open, setOpen] = useState<number | null>(1);
  const current = open === null ? null : FAQS[open];

  useLayoutEffect(() => {
    report({
      metric: t("展开条目", "Open item"),
      value: current ? `${open! + 1} / ${FAQS.length}` : t("全部收起", "All folded"),
      hint: current ? current.q : t("标题先在，正文按需", "Titles first, bodies on demand"),
      ratio: current ? (open! + 1) / FAQS.length : 0,
    });
  }, [current, open, report, t]);

  return (
    <div data-scroller="locator" className="h-full overflow-y-auto px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-fg">常见问题</h3>
          <p className="mt-1 text-[12px] text-fg-muted">默认只露标题。扫完再打开一条。</p>
        </div>
        <p className="font-mono text-[11px] text-fg-subtle">
          {open === null ? "0" : "1"} / {FAQS.length} 展开
        </p>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
        {FAQS.map((item, index) => {
          const expanded = open === index;
          return (
            <li key={item.q} className={index > 0 ? "border-t border-border" : undefined}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : index)}
                className={cn(
                  "flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left text-[13px] transition-colors",
                  expanded ? "bg-play-glow font-medium text-fg" : "text-fg hover:bg-surface-2/70",
                )}
              >
                <span>{item.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 text-fg-subtle transition-transform duration-200",
                    expanded && "rotate-180 text-accent",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-[280ms] ease-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="border-t border-border/60 bg-surface-2/40 px-4 py-3.5">
                    <p className="text-[13px] leading-relaxed text-fg-muted">{item.a}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] text-fg-subtle"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
