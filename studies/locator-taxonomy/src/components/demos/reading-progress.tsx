import { useEffect, useRef, useState } from "react";
import { calculateProgressRatio } from "../../lib/machines";

const CHAPTERS = [
  {
    title: "1. 为什么阅读进度能降低不确定感？",
    body: "阅读长文或研究报告时，用户最容易产生的心理顾虑是「这条路还有多长」。底部或顶部的纤细进度条以极低的视觉侵入性，提供了持续、可预测的完成度参照。",
  },
  {
    title: "2. 进度计算分母的常见陷阱",
    body: "分母必须是 scrollHeight - clientHeight，而不是直接用 scrollHeight。如果用 scrollHeight，滚动到最底部时进度只能到达 (scrollHeight - clientHeight)/scrollHeight，永远无法达到 100%。",
  },
  {
    title: "3. 贴边固定与正文留白",
    body: "阅读进度指示器应当贴合在容器底边或顶边，并带轻微的半透明磨砂背景，避免遮盖正文最后一行文字，且读完 100% 后依然稳定呈现，而不是突兀消失。",
  },
  {
    title: "4. 到达终点后的下一步指引",
    body: "当进度达到 100% 时，界面应当提供明确的下一步去向（如相关文档推荐、返回目录、提交操作），而不是把用户扔在空白底部。",
  },
  {
    title: "5. 性能优化与 requestAnimationFrame",
    body: "在滚动高频触发的场景下，结合 passive: true 监听与 requestAnimationFrame 节流计算，确保即使在低功耗设备上也能保持 60fps 丝滑渲染。",
  },
];

export function ReadingProgressDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setRatio(calculateProgressRatio(el.scrollTop, el.scrollHeight, el.clientHeight));
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);

  const pct = Math.round(ratio * 100);

  return (
    <div className="relative h-full">
      <div ref={scrollerRef} className="h-full overflow-y-auto px-5 pt-5 pb-16 sm:px-8">
        <p className="text-[11px] font-mono tracking-wide text-fg-subtle">
          Longform Essay · 20 min read
        </p>

        <article className="mt-2 max-w-xl space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-fg">
            连续阅读体验与进度反馈
          </h2>
          <p className="text-sm leading-relaxed text-fg-muted">
            向下滚动阅读文章，观察底部进度条的实时推进。
          </p>

          {CHAPTERS.map((ch) => (
            <section key={ch.title} className="space-y-2 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold text-fg">{ch.title}</h3>
              <p className="text-xs leading-relaxed text-fg-muted">{ch.body}</p>
            </section>
          ))}

          <div className="rounded-xl border border-border bg-surface-2/60 p-4 text-xs text-fg-muted">
            🎉 你已读完本篇内容。可以尝试点击左侧菜单体验其他定位器。
          </div>
        </article>
      </div>

      {/* Bottom Sticky Progress Bar */}
      <div className="absolute inset-x-0 bottom-0 border-t border-border bg-surface/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between text-[11px] text-fg-muted">
          <span className="font-medium">阅读进度 {pct}%</span>
          <span className="font-mono">{pct >= 100 ? "已完成" : "继续向下浏览"}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-100 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
