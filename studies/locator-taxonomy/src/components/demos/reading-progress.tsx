import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { calculateProgressRatio } from "../../lib/machines";
import { useContainerScroll } from "../../lib/use-container-scroll";
import { cn } from "../../lib/utils";

const CHAPTERS = [
  {
    title: "为什么阅读进度能降低不确定感",
    body: "阅读长文时，最先冒出的顾虑是「这条路还有多长」。贴边的细进度以极低侵入性，持续给出可预测的完成度，而不是让人猜滚动条还剩几截。",
  },
  {
    title: "进度计算分母的常见陷阱",
    body: "分母必须是 scrollHeight − clientHeight。若直接除以 scrollHeight，滚到最底也只能停在一个永远小于 1 的比例，读完却到不了 100%。",
  },
  {
    title: "贴边固定与正文留白",
    body: "指示器贴在容器底边，带一层薄背景，不盖住最后一行。读完 100% 后仍然留驻，告诉人这篇已经走完，而不是突然消失。",
  },
  {
    title: "到达终点后的下一步",
    body: "进度到 100% 时，页面应给出下一去向：相关篇目、返回目录、或提交。不要把人扔在空白底部。",
  },
  {
    title: "滚动高频下的节流",
    body: "scroll 用 passive 监听，计算放进 requestAnimationFrame，低功耗设备上也能稳住帧率。进度报的是任务深度，不是把滚动条换个皮。",
  },
];

export function ReadingProgressDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const snap = useContainerScroll(scrollerRef);
  const [chapter, setChapter] = useState(0);

  const ratio = calculateProgressRatio(snap.scrollTop, snap.scrollHeight, snap.clientHeight);
  const pct = Math.round(ratio * 100);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.chapter);
        if (Number.isFinite(index)) setChapter(index);
      },
      { root, rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4, 0.75] },
    );

    root.querySelectorAll("[data-chapter]").forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const done = pct >= 100;
    const title = CHAPTERS[chapter]?.title ?? CHAPTERS[0].title;
    report({
      metric: t("阅读完成度", "Reading completion"),
      value: done ? t("100% · 已读完，进度留驻", "100% · finished, still here") : `${pct}%`,
      hint: done ? t("可以离开这篇", "Ready to leave") : `${chapter + 1} / ${CHAPTERS.length} · ${title}`,
      ratio,
    });
  }, [chapter, pct, ratio, report, t]);

  return (
    <div className="relative h-full">
      <div ref={scrollerRef} data-scroller="locator" className="h-full overflow-y-auto px-5 pt-5 pb-20 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
          Longform · 连续阅读
        </p>
        <article className="mt-2 max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight text-fg">连续阅读与剩余深度</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            向下读。底部细条报的是这篇还剩多深，不是滚动条换了皮肤。
          </p>

          {CHAPTERS.map((ch, index) => (
            <section
              key={ch.title}
              data-chapter={index}
              className={cn(
                "mt-6 border-t border-border/70 pt-5 transition-colors",
                chapter === index && "border-accent/40",
              )}
            >
              <p className="font-mono text-[10px] tracking-[0.14em] text-accent">
                {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-[15px] font-semibold text-fg">{ch.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{ch.body}</p>
            </section>
          ))}

          <div className="mt-8 rounded-xl border border-border bg-surface-2/70 px-4 py-4">
            <p className="text-[13px] font-medium text-fg">这篇已经走完</p>
            <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
              进度停在 100%，不卸下。下一步可以是相关篇目，或换一种意图看别的定位器。
            </p>
          </div>
        </article>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-border bg-surface/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="font-medium text-fg">
            {pct >= 100 ? "已读完" : `阅读进度 ${pct}%`}
          </span>
          <span className="truncate font-mono text-fg-muted">
            {pct >= 100 ? "留驻" : CHAPTERS[chapter]?.title}
          </span>
        </div>
        <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${pct}%` }}
            role="meter"
            aria-label="阅读进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          />
          {CHAPTERS.map((_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="absolute top-0 h-full w-px bg-surface/70"
              style={{ left: `${((index + 1) / CHAPTERS.length) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
