import { useEffect, useRef, useState } from "react";
import { cn, prefersReducedMotion, smoothScrollTo } from "../../lib/utils";

const GROUPS = [
  {
    id: "overview",
    name: "入门概览",
    items: [
      { num: "01", title: "定位器核心原则", desc: "按意图匹配不同工具" },
      { num: "02", title: "空间参照体系", desc: "建立稳定的相对坐标" },
      { num: "03", title: "性能与渲染边界", desc: "虚拟滚动与局部观察" },
    ],
  },
  {
    id: "reading",
    name: "深度阅读",
    items: [
      { num: "04", title: "阅读进度指示器", desc: "反馈剩余深度与百分比" },
      { num: "05", title: "智能返回顶部", desc: "阈值触发与防遮挡" },
      { num: "06", title: "章节标题吸顶", desc: "滚动过程中的当前态" },
    ],
  },
  {
    id: "search",
    name: "检索与筛选",
    items: [
      { num: "07", title: "行内即时检索", desc: "分词打分与关键词高亮" },
      { num: "08", title: "状态分面筛选", desc: "带计数的即时切片" },
      { num: "09", title: "空结果定向指引", desc: "无结果时的邻近推荐" },
    ],
  },
  {
    id: "tasks",
    name: "流程与表单",
    items: [
      { num: "10", title: "受控步骤向导", desc: "阶段推进与回退约束" },
      { num: "11", title: "渐进折叠面板", desc: "CSS Grid 高度平滑过渡" },
      { num: "12", title: "破坏性操作拦截", desc: "二次确认阶梯机制" },
    ],
  },
];

export function AnchorNavDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(GROUPS[0].id);
  const lockRef = useRef(false);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        root,
        rootMargin: "-10% 0px -60% 0px",
        threshold: [0, 0.25, 0.75, 1],
      },
    );

    GROUPS.forEach((g) => {
      const el = root.querySelector(`#${g.id}`);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  function jump(id: string) {
    const root = scrollerRef.current;
    const target = root?.querySelector<HTMLElement>(`#${id}`);
    if (!root || !target) return;

    const top =
      target.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop -
      12;

    setActive(id);
    lockRef.current = true;
    smoothScrollTo(root, Math.max(0, top));

    window.setTimeout(
      () => {
        lockRef.current = false;
      },
      prefersReducedMotion() ? 50 : 400,
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col sm:flex-row">
      {/* Mobile Pills */}
      <nav aria-label="章节导航" className="shrink-0 border-b border-border bg-surface-2/40 px-3 py-2 sm:hidden">
        <ul className="flex gap-1.5 overflow-x-auto">
          {GROUPS.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => jump(group.id)}
                className={cn(
                  "inline-flex min-h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium transition-colors",
                  active === group.id
                    ? "bg-accent text-accent-fg"
                    : "bg-surface border border-border text-fg-muted",
                )}
              >
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Scroller */}
      <div ref={scrollerRef} className="min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {GROUPS.map((group, gIdx) => (
          <section key={group.id} id={group.id} className="scroll-mt-4 pb-8">
            <h3 className="mb-3 text-xs font-mono font-semibold tracking-wider text-fg-subtle uppercase">
              0{gIdx + 1} · {group.name}
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {group.items.map((item) => (
                <article
                  key={item.num}
                  className="rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-all hover:border-border-strong"
                >
                  <span className="font-mono text-xs font-semibold text-accent">{item.num}</span>
                  <h4 className="mt-1 text-sm font-medium text-fg">{item.title}</h4>
                  <p className="mt-1 text-[11px] text-fg-muted">{item.desc}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Desktop Lateral TOC */}
      <nav
        aria-label="大纲目录"
        className="hidden w-36 shrink-0 border-l border-border bg-surface-2/30 p-4 sm:block"
      >
        <p className="text-[10px] font-mono font-semibold tracking-wider text-fg-subtle uppercase">
          Table of Contents
        </p>
        <ul className="mt-3 space-y-1">
          {GROUPS.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => jump(group.id)}
                className={cn(
                  "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                  active === group.id
                    ? "bg-accent-soft font-semibold text-accent"
                    : "text-fg-muted hover:bg-surface hover:text-fg",
                )}
              >
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
