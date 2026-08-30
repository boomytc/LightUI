import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { shouldShowBackToTop } from "../../lib/machines";
import { cn, smoothScrollTo } from "../../lib/utils";

const SECTIONS = [
  {
    title: "一、为什么长页面需要专用返回通道？",
    body: "当用户连续浏览数千像素后，如果想回到页面头部查看导航或修改筛选条件，机械地上滑需要数十次操作。一个在合适阈值出现的返回顶部按钮，能极大降低深层回溯成本。",
  },
  {
    title: "二、阈值设定：过早或过晚都不合适",
    body: "如果用户刚滚 50px 就弹出浮动按钮，会分散首屏注意力；如果滚到第 5 屏才出现，又失去了辅助意义。通常推荐在滚动超过 1.5～2 屏（约 240px～300px）后平滑淡入。",
  },
  {
    title: "三、容器滚动 vs 全局滚动",
    body: "许多现代应用把内容放在局部 overflow-y 容器中，此时必须在局部容器上挂载 scroll 监听并读取 scrollTop，切忌监听 window.scrollY，否则会导致按钮永远不触发。",
  },
  {
    title: "四、兼顾 reduced-motion 无障碍体验",
    body: "对开启了减少动效偏好的用户，平滑滚动（smooth scroll）应自动降级为即时跳转（auto），避免长距离动画带来晕眩或视觉不适。",
  },
  {
    title: "五、避免遮挡右下角关键操作",
    body: "在移动端或表单页面中，返回顶部按钮的位置需与悬浮提交栏、客服气泡或右下角 FAB 按钮错开，保留清晰的视觉与点击间距。",
  },
];

export function BackToTopDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => setShow(shouldShowBackToTop(el.scrollTop, 200));
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative h-full">
      <div ref={scrollerRef} className="h-full overflow-y-auto px-5 py-5 sm:px-8">
        <p className="text-[11px] font-mono tracking-wide text-fg-subtle">
          Design Craft · 15 min read
        </p>

        <article className="mt-2 max-w-xl space-y-6 pb-20">
          <h2 className="text-xl font-bold tracking-tight text-fg">
            长页面返回机制与阈值设计
          </h2>
          <p className="text-sm leading-relaxed text-fg-muted">
            向下滚动文章，观察右下角回顶按钮的浮现时机与平滑返回交互。
          </p>

          {SECTIONS.map((sec) => (
            <section key={sec.title} className="space-y-2 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold text-fg">{sec.title}</h3>
              <p className="text-xs leading-relaxed text-fg-muted">{sec.body}</p>
            </section>
          ))}
        </article>
      </div>

      {/* Back to top floating button */}
      <button
        type="button"
        aria-label="返回顶部"
        onClick={() => {
          if (scrollerRef.current) smoothScrollTo(scrollerRef.current, 0);
        }}
        className={cn(
          "absolute right-5 bottom-5 flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg shadow-card transition-all duration-200",
          show
            ? "pointer-events-auto scale-100 opacity-100 hover:bg-accent/90 hover:scale-105"
            : "pointer-events-none scale-75 opacity-0",
        )}
      >
        <ArrowUp className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
