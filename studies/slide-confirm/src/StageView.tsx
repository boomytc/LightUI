import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronsRight, RotateCcw } from "lucide-react";
import {
  calcDampedOffset,
  calcMaxTravel,
  calcSlideProgress,
  calcTextOpacity,
  isThresholdReached,
  type SlideState,
} from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { loc, pick, useLocale } from "./lib/site-locale";
import "./slide.css";

export function StageView() {
  const locale = useLocale();
  const en = locale === "en";
  const query = readStageQuery();
  const [state, setState] = useState<SlideState>(query.state === "committed" ? "committed" : "idle");
  const [rawDx, setRawDx] = useState(0);
  const [trackWidth, setTrackWidth] = useState(360);
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const resetTimer = useRef<number | null>(null);
  const thumbWidth = 48; // px

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    function measure() {
      if (trackRef.current) {
        const width = trackRef.current.offsetWidth || trackRef.current.clientWidth;
        if (width > 0) {
          setTrackWidth(width);
        }
      }
    }
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (trackRef.current && ro) {
      ro.observe(trackRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const maxTravel = calcMaxTravel(trackWidth, thumbWidth, 8);
  const visualOffset =
    state === "committed"
      ? maxTravel
      : state === "idle"
        ? 0
        : calcDampedOffset(rawDx, maxTravel);
  const progress = calcSlideProgress(visualOffset, maxTravel);
  const textOpacity = state === "committed" ? 0 : calcTextOpacity(progress);
  const thresholdReached = isThresholdReached(progress, 0.85);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (state === "committed") return;
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    setState("dragging");
    setRawDx(0);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (state !== "dragging") return;
    const dx = e.clientX - startX.current;
    setRawDx(dx);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (state !== "dragging") return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const curProgress = calcSlideProgress(rawDx, maxTravel);
    if (isThresholdReached(curProgress, 0.85)) {
      setState("committed");
      setRawDx(maxTravel);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(40);
        } catch {}
      }
    } else {
      setRawDx(0);
      if (reduced) {
        setState("idle");
      } else {
        setState("resetting");
        resetTimer.current = window.setTimeout(() => {
          setState("idle");
          resetTimer.current = null;
        }, 300);
      }
    }
  }

  function handleReset() {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    setRawDx(0);
    if (reduced) {
      setState("idle");
      return;
    }
    setState("resetting");
    resetTimer.current = window.setTimeout(() => {
      setState("idle");
      resetTimer.current = null;
    }, 300);
  }

  const scenarioMeta = {
    destroy: {
      title: loc("销毁生产服务器实例", "Destroy production server"),
      subtitle: loc(
        "所有实例挂载的卷与未快照数据将永久清除",
        "All attached volumes and unbacked data will be permanently erased",
      ),
      prompt: loc("滑动以确认销毁", "Slide to confirm destroy"),
      committedText: loc("服务器实例已安全销毁", "Server instance destroyed"),
    },
    transfer: {
      title: loc("向境外未知账户转账 ¥50,000", "Wire ¥50,000 to overseas account"),
      subtitle: loc(
        "资金一旦汇出不可撤回，请核对收款人",
        "Funds cannot be recalled once wired — verify recipient first",
      ),
      prompt: loc("滑动以确认转账", "Slide to confirm transfer"),
      committedText: loc("大额转账指令已成功提交", "Wire transfer submitted"),
    },
    delete_account: {
      title: loc("永久注销当前主账号", "Permanently delete primary account"),
      subtitle: loc(
        "该操作不可撤回，所有权益与资产将彻底清空",
        "Irreversible — all entitlements and assets will be cleared",
      ),
      prompt: loc("滑动以确认注销", "Slide to confirm deletion"),
      committedText: loc("主账号注销流程已锁定", "Account deletion locked"),
    },
  }[query.scenario];

  return (
    <div
      data-stage="root"
      className="flex min-h-dvh w-full items-center justify-center p-6 sm:p-10 bg-bg text-fg select-none"
    >
      <div
        data-stage="fixture"
        className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-card"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-wrong/10 text-wrong shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-fg tracking-tight">
              {pick(scenarioMeta.title, locale)}
            </h3>
            <p className="text-[12px] text-fg-muted mt-0.5 leading-snug">
              {pick(scenarioMeta.subtitle, locale)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {/* 滑动轨道容器 */}
          <div
            ref={trackRef}
            className="relative flex h-14 w-full items-center overflow-hidden rounded-full border border-border bg-surface-2 p-1 touch-none"
          >
            {/* 动态填充进度底色 */}
            <div
              className={`absolute left-1 top-1 bottom-1 rounded-full transition-colors duration-200 ${
                state === "committed"
                  ? "bg-wrong/20"
                  : thresholdReached
                    ? "bg-wrong/25"
                    : "bg-accent/15"
              }`}
              style={{
                width: `${visualOffset + thumbWidth}px`,
                transition: reduced
                  ? "none"
                  : state === "resetting"
                    ? "width 300ms cubic-bezier(0.25, 1, 0.5, 1)"
                    : state === "committed"
                      ? "width 180ms cubic-bezier(0.25, 1, 0.5, 1)"
                      : "none",
              }}
            />

            {/* 轨道中央提示文字 */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[13px] font-medium tracking-wide text-fg-muted"
              style={{
                opacity: textOpacity,
                transition: reduced
                  ? "none"
                  : state === "resetting"
                    ? "opacity 300ms ease"
                    : state === "committed"
                      ? "opacity 150ms ease"
                      : "none",
              }}
            >
              <span className="relative overflow-hidden">
                {pick(scenarioMeta.prompt, locale)}
                {state === "idle" && !reduced && (
                  <span
                    aria-hidden="true"
                    className="animate-slide-sheen absolute inset-0 bg-gradient-to-r from-transparent via-fg/20 to-transparent"
                  />
                )}
              </span>
            </div>

            {/* 滑动抓手 (Thumb) */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute left-1 top-1 bottom-1 size-12 rounded-full flex items-center justify-center text-white shadow-md cursor-grab active:cursor-grabbing transition-transform ${
                state === "committed"
                  ? "bg-wrong text-white"
                  : thresholdReached
                    ? "bg-wrong"
                    : "bg-fg text-surface"
              }`}
              style={{
                transform: `translateX(${visualOffset}px)`,
                transition: reduced
                  ? "none"
                  : state === "resetting"
                    ? "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)"
                    : state === "committed"
                      ? "transform 180ms cubic-bezier(0.25, 1, 0.5, 1)"
                      : "none",
              }}
            >
              {state === "committed" ? (
                <Check className="size-5" />
              ) : (
                <ChevronsRight className={`size-5 ${reduced ? "" : "motion-safe:animate-pulse"}`} />
              )}
            </div>
          </div>
        </div>

        {/* 状态与回置反馈栏 */}
        <div className="mt-4 flex min-h-[32px] items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block size-2 rounded-full ${
                state === "committed"
                  ? `bg-wrong ${reduced ? "" : "motion-safe:animate-ping"}`
                  : state === "dragging"
                    ? "bg-accent"
                    : "bg-border-strong"
              }`}
            />
            <span className="font-mono text-fg-subtle">
              {state === "committed"
                ? pick(scenarioMeta.committedText, locale)
                : state === "dragging"
                  ? en
                    ? `Progress: ${Math.round(progress * 100)}% (${thresholdReached ? "threshold met" : "below threshold"})`
                    : `进度: ${Math.round(progress * 100)}% (${thresholdReached ? "已达阈值" : "未达阈值"})`
                  : en
                    ? "Ready to slide"
                    : "待滑动"}
            </span>
          </div>

          {state === "committed" && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-accent hover:bg-surface-2 transition-colors"
            >
              <RotateCcw className="size-3" />
              <span>{en ? "Reset" : "重置"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
