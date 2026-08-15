import { useEffect, useRef, useState } from "react";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { shouldStepWheel, stepIndex, wheelOffset, wheelVisual } from "../lib/wheel";
import { Frame } from "./Frame";

const WORKS = [
  {
    id: "brand",
    label: loc("品牌设计", "Brand"),
    body: loc("从策略到包装，建立克制而温暖的视觉语言。", "From strategy to packaging, a warm and restrained system."),
  },
  {
    id: "web",
    label: loc("网页设计", "Web"),
    body: loc("整理复杂的信息架构，让团队更快找到任务。", "Tidy a dense IA so the team can find the work."),
  },
  {
    id: "motion",
    label: loc("动态视觉", "Motion"),
    body: loc("用节奏、字体与形状构建可延展的动态系统。", "Rhythm, type, and shape as an extensible motion system."),
  },
  {
    id: "photo",
    label: loc("摄影", "Photo"),
    body: loc("以低饱和与硬光记录物与人的距离。", "Low saturation and hard light, and let the picture speak."),
  },
  {
    id: "space",
    label: loc("空间视觉", "Space"),
    body: loc("把平面系统延伸到空间导视。", "Extend the print system into wayfinding."),
  },
];

export function WheelDemo() {
  const locale = useLocale();
  const [active, setActive] = useState(1);
  const lock = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const work = WORKS[active] ?? WORKS[0];

  function move(dir: number) {
    setActive((i) => stepIndex(i, dir, WORKS.length));
  }

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const step = shouldStepWheel(event.deltaY);
      if (!step) return;
      event.preventDefault();
      if (lock.current) return;
      lock.current = true;
      move(step);
      window.setTimeout(() => {
        lock.current = false;
      }, 280);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Frame title={locale === "en" ? "Portfolio" : "作品集"} dark>
      <div
        ref={stageRef}
        className="relative flex min-h-[22rem] select-none overflow-hidden bg-fg text-surface"
      >
        <div className="relative z-10 flex w-[44%] min-w-36 flex-col justify-center pl-5">
          <p className="mb-6 text-[11px] tracking-[0.16em] text-white/45 uppercase">
            {locale === "en" ? "Studio" : "工作室"}
          </p>
          <div className="relative h-72">
            {WORKS.map((item, index) => {
              const visual = wheelVisual(wheelOffset(index, active));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className="absolute top-1/2 left-0 flex items-center gap-3 text-left"
                  style={{
                    transform: `translate(${visual.x}px, calc(-50% + ${visual.y}px)) rotate(${visual.rotate}deg) scale(${visual.scale})`,
                    opacity: visual.opacity,
                    filter: `blur(${visual.blur}px)`,
                    transition:
                      "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms, filter 350ms",
                    zIndex: 10 - Math.abs(index - active),
                  }}
                >
                  <span
                    className={cn(
                      "h-px shrink-0 bg-surface transition-[opacity,width] duration-300",
                      visual.baseline ? "w-5 opacity-100" : "w-4 opacity-0",
                    )}
                  />
                  <span className={visual.baseline ? "text-[1.35rem] font-semibold" : "text-[1.15rem]"}>
                    {pick(item.label, locale)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-white/45">
            {locale === "en" ? "Scroll or ↑↓ · highlight only on the baseline" : "滚动或 ↑↓ · 到达基准线才高亮"}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-8">
          <p className="text-[11px] tracking-[0.14em] text-white/45 uppercase">
            {pick(work.label, locale)}
          </p>
          <h3 className="mt-2 text-[1.7rem] font-semibold tracking-tight">{pick(work.label, locale)}</h3>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/55">{pick(work.body, locale)}</p>
          <div className="mt-6 aspect-[5/3] max-w-sm rounded-xl bg-white/8" />
        </div>
      </div>
    </Frame>
  );
}
