import { ArrowUp } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { DEFAULT_BACK_TO_TOP_THRESHOLD, shouldShowBackToTop } from "../../lib/machines";
import { useContainerScroll } from "../../lib/use-container-scroll";
import { cn, smoothScrollTo } from "../../lib/utils";

const SECTIONS = [
  {
    title: "为什么长页面需要专用返回通道",
    body: "连续浏览数千像素后，若要回到顶部改筛选或看目录，机械上滑要许多次。阈值之后浮现的回顶，把深层回溯收成一下。",
  },
  {
    title: "阈值：过早或过晚都不合适",
    body: "刚滚 50px 就弹出，会抢首屏；滚到第五屏才出现，又来晚了。常用口径是超过 1.5～2 屏，约 240px，再平滑淡入。",
  },
  {
    title: "容器滚动，不是 window",
    body: "许多界面把正文放在局部 overflow 里。必须听这个容器的 scrollTop。听 window.scrollY，按钮会永远不出现。",
  },
  {
    title: "尊重减少动效",
    body: "开启减少动效时，平滑滚动应降级为即时跳转，避免长距离动画造成晕眩。",
  },
  {
    title: "不要挡住右下角别的手",
    body: "回顶要和悬浮提交、客服气泡错开，留出点击间距。它是回到起点的通道，不是又一个 FAB。",
  },
];

export function BackToTopDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const snap = useContainerScroll(scrollerRef);
  const show = shouldShowBackToTop(snap.scrollTop, DEFAULT_BACK_TO_TOP_THRESHOLD);
  const remain = Math.max(0, Math.ceil(DEFAULT_BACK_TO_TOP_THRESHOLD - snap.scrollTop));
  const depth = Math.min(1, snap.scrollTop / Math.max(1, snap.scrollHeight - snap.clientHeight));

  useLayoutEffect(() => {
    report({
      metric: t("回顶阈值", "Return threshold"),
      value: show
        ? t(`已过 ${DEFAULT_BACK_TO_TOP_THRESHOLD}px`, `Past ${DEFAULT_BACK_TO_TOP_THRESHOLD}px`)
        : t(`再滚 ${remain}px`, `${remain}px to go`),
      hint: show ? t("回顶通道已打开", "Return control is open") : t(`当前 ${Math.round(snap.scrollTop)}px`, `Now ${Math.round(snap.scrollTop)}px`),
      ratio: show ? 1 : 1 - remain / DEFAULT_BACK_TO_TOP_THRESHOLD,
    });
  }, [remain, report, show, snap.scrollTop, t]);

  return (
    <div className="relative h-full">
      <div ref={scrollerRef} data-scroller="locator" className="h-full overflow-y-auto px-5 py-5 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
          Recovery · 深层回起点
        </p>
        <article className="mt-2 max-w-xl pb-24">
          <h2 className="text-xl font-semibold tracking-tight text-fg">返回顶部的出现时机</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            向下滚过 240px。按钮在容器里听滚动，不会误听整窗。
          </p>

          <div className="mt-5 rounded-xl border border-border bg-surface-2/60 px-3 py-3">
            <div className="flex items-center justify-between text-[11px] text-fg-muted">
              <span>距阈值</span>
              <span className="font-mono tabular-nums">
                {Math.round(snap.scrollTop)} / {DEFAULT_BACK_TO_TOP_THRESHOLD}
              </span>
            </div>
            <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
                style={{
                  width: `${Math.min(100, (snap.scrollTop / DEFAULT_BACK_TO_TOP_THRESHOLD) * 100)}%`,
                }}
              />
            </div>
          </div>

          {SECTIONS.map((sec) => (
            <section key={sec.title} className="mt-6 space-y-2 border-t border-border/70 pt-5">
              <h3 className="text-[15px] font-semibold text-fg">{sec.title}</h3>
              <p className="text-[13px] leading-relaxed text-fg-muted">{sec.body}</p>
            </section>
          ))}
        </article>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 right-3 bottom-20 w-px bg-border"
      >
        <span
          className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-accent transition-[top] duration-150 ease-out"
          style={{ top: `${Math.min(96, depth * 100)}%` }}
        />
      </div>

      <button
        type="button"
        aria-label="返回顶部"
        onClick={() => {
          if (scrollerRef.current) smoothScrollTo(scrollerRef.current, 0);
        }}
        className={cn(
          "absolute right-5 bottom-5 flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-card transition-all duration-200",
          show
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100 hover:scale-105"
            : "pointer-events-none translate-y-2 scale-90 opacity-0",
        )}
      >
        <ArrowUp className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
