import { useState } from "react";
import { cn } from "../../lib/utils";

const FAQS = [
  {
    q: "如何建立不会让人迷路的长页面？",
    a: "先根据用户意图分类：连续阅读用阅读进度与返回顶部；结构检索用侧边锚点大纲；复杂表单用步骤向导；低频参数用折叠面板；精准查找用行内检索。",
    tags: ["知识库", "信息架构"],
  },
  {
    q: "哪些内容适合默认折叠收拢？",
    a: "低频参数说明、进阶配置、常见 FAQ 与故障排查细节。关键标题必须保持可见以供扫读，答案只在点击时按需展开，避免一次性冲淡核心主干。",
    tags: ["渐进披露", "折叠面板"],
  },
  {
    q: "折叠面板的高度过渡该怎么做？",
    a: "推荐采用现代 CSS 的 grid-template-rows: 0fr / 1fr 过渡方案。相比 JS 动态测量 scrollHeight，CSS Grid 能够避免重排抖动并完美适配动态内容变化。",
    tags: ["CSS Grid", "动画细节"],
  },
  {
    q: "页面结构调整时，旧锚点会失效吗？",
    a: "应当尽量保留旧锚点 ID 并设置平滑重定向，避免用户已收藏或分享的 URL Hash 无法正确定位到对应段落。",
    tags: ["锚点维护", "URL Hash"],
  },
  {
    q: "移动端窄屏如何适配大纲导航？",
    a: "窄屏下不宜占用双栏空间，可将大纲目录收纳为顶部横向滚动药丸（Pills）或抽屉浮层，保留至少 44px 触控热区。",
    tags: ["移动端", "响应式"],
  },
];

export function AccordionDemo() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-fg">常见问题与排查指南</h3>
        <p className="mt-0.5 text-xs text-fg-muted">默认收起细节，标题先成为快速扫读线索</p>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {FAQS.map((item, i) => {
          const expanded = open === i;
          return (
            <li key={item.q}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : i)}
                className={cn(
                  "flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm transition-colors",
                  expanded ? "bg-surface-2 font-medium text-fg" : "text-fg hover:bg-surface-2/60",
                )}
              >
                <span>{item.q}</span>
                <span
                  className="relative size-6 shrink-0 rounded-full border border-border bg-surface grid place-items-center"
                  aria-hidden="true"
                >
                  <span className="absolute h-px w-2.5 bg-fg-muted" />
                  <span
                    className={cn(
                      "absolute h-2.5 w-px bg-fg-muted transition-transform duration-200",
                      expanded && "scale-y-0",
                    )}
                  />
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border/50 bg-surface-2/30 px-4 py-3.5">
                    <p className="text-xs leading-relaxed text-fg-muted">{item.a}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
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
