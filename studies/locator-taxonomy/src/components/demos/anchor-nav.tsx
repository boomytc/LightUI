import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { cn, prefersReducedMotion, smoothScrollTo } from "../../lib/utils";

const GROUPS = [
  {
    id: "overview",
    name: "入门概览",
    items: [
      { num: "01", title: "先定意图再给工具", desc: "阅读、跳转、折叠、检索不是同一种滚" },
      { num: "02", title: "空间参照要稳定", desc: "人要能说出自己在哪一节" },
      { num: "03", title: "观察局部，不要听整窗", desc: "目录跟的是这个容器的交叉" },
    ],
  },
  {
    id: "reading",
    name: "深度阅读",
    items: [
      { num: "04", title: "阅读进度指示器", desc: "报剩余深度，不是轨道皮肤" },
      { num: "05", title: "阈值之后才回顶", desc: "容器内滚动，过 240px 再出现" },
      { num: "06", title: "当前节可以开口", desc: "滚动时标题跟着高亮" },
    ],
  },
  {
    id: "search",
    name: "检索与筛选",
    items: [
      { num: "07", title: "行内即时检索", desc: "标题权重大于标签和正文" },
      { num: "08", title: "状态分面筛选", desc: "计数跟着切片走" },
      { num: "09", title: "空结果要给路", desc: "没有命中时指出邻近词" },
    ],
  },
  {
    id: "tasks",
    name: "流程与表单",
    items: [
      { num: "10", title: "受控步骤向导", desc: "可回看，不可越级向前" },
      { num: "11", title: "渐进折叠面板", desc: "标题先在，正文按需" },
      { num: "12", title: "阶段不是字段披露", desc: "向导锁顺序，披露只展开" },
    ],
  },
];

export function AnchorNavDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const [active, setActive] = useState(GROUPS[0].id);
  const lockRef = useRef(false);
  const activeIndex = Math.max(0, GROUPS.findIndex((group) => group.id === active));
  const activeGroup = GROUPS[activeIndex] ?? GROUPS[0];

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        root,
        rootMargin: "-12% 0px -58% 0px",
        threshold: [0, 0.25, 0.55, 1],
      },
    );

    GROUPS.forEach((group) => {
      const el = root.querySelector(`#${group.id}`);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    report({
      metric: t("当前章节", "Current section"),
      value: activeGroup.name,
      hint: `${activeIndex + 1} / ${GROUPS.length}`,
      ratio: (activeIndex + 1) / GROUPS.length,
    });
  }, [activeGroup.name, activeIndex, report, t]);

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
      prefersReducedMotion() ? 50 : 420,
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col sm:flex-row">
      <nav aria-label="章节导航" className="shrink-0 border-b border-border bg-surface-2/50 px-3 py-2 sm:hidden">
        <ul className="flex gap-1.5 overflow-x-auto">
          {GROUPS.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => jump(group.id)}
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-xs font-medium transition-colors",
                  active === group.id
                    ? "bg-accent text-accent-fg"
                    : "border border-border bg-surface text-fg-muted",
                )}
              >
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div ref={scrollerRef} data-scroller="locator" className="min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <p className="sticky top-0 z-10 -mx-5 mb-4 border-b border-border bg-surface/90 px-5 py-2 text-[11px] backdrop-blur-sm sm:-mx-6 sm:px-6">
          <span className="text-fg-subtle">{GROUPS.length} 节可跳 · 现在在</span>
          <span className="ml-1.5 font-semibold text-fg">{activeGroup.name}</span>
        </p>

        {GROUPS.map((group, groupIndex) => (
          <section
            key={group.id}
            id={group.id}
            className={cn(
              "scroll-mt-12 rounded-2xl border px-4 py-4 pb-6 transition-colors",
              groupIndex > 0 && "mt-5",
              active === group.id
                ? "border-accent/35 bg-accent-soft/25"
                : "border-transparent bg-transparent",
            )}
          >
            <h3 className="mb-3 font-mono text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
              {String(groupIndex + 1).padStart(2, "0")} · {group.name}
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {group.items.map((item) => (
                <article
                  key={item.num}
                  className="rounded-xl border border-border bg-surface p-3.5 shadow-sm"
                >
                  <span className="font-mono text-xs font-semibold text-accent">{item.num}</span>
                  <h4 className="mt-1 text-sm font-medium text-fg">{item.title}</h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{item.desc}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <nav
        aria-label="大纲目录"
        className="relative hidden w-44 shrink-0 border-l border-border bg-surface-2/40 p-4 sm:block"
      >
        <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
          Outline
        </p>
        <ul className="relative mt-3 space-y-1">
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 h-8 w-[3px] rounded-full bg-accent transition-transform duration-200 ease-out"
            style={{ transform: `translateY(${activeIndex * 36}px)` }}
          />
          {GROUPS.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => jump(group.id)}
                className={cn(
                  "flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[12px] transition-colors",
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
