import { ChevronRight } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { formatTimeString } from "./lib/machines";
import { WheelDrum } from "./wheel/WheelDrum";
import { WheelStaticColumn } from "./wheel/WheelStaticColumn";
import "./wheel/wheel.css";

export function StageView() {
  const { hour, minute } = readStageQuery();

  return (
    <div data-stage="root" className="flex min-h-dvh items-center justify-center bg-bg p-4 sm:p-8">
      <div
        data-stage="fixture"
        className="wheel-phone"
        style={{ maxWidth: 340 }}
      >
        <div className="wheel-phone-notch" />
        <div className="wheel-phone-screen" style={{ height: 580 }}>
          <div className="flex items-center justify-between px-7 pt-4 pb-1 text-[11px] font-medium text-fg-muted">
            <span className="tabular-nums">9:41</span>
            <span>5G · 100%</span>
          </div>

          <div className="flex items-center justify-between px-6 pt-4">
            <span className="text-xs text-accent">取消</span>
            <h2 className="text-sm font-semibold text-fg">编辑闹钟</h2>
            <span className="text-xs font-semibold text-accent">存储</span>
          </div>

          <div className="mt-5 text-center">
            <p className="font-mono text-5xl font-semibold tracking-tight tabular-nums text-fg">
              {formatTimeString(hour, minute)}
            </p>
            <p className="mt-1.5 text-[11px] text-fg-muted">早上 · 响铃一次</p>
          </div>

          <div className="mx-4 mt-6 rounded-2xl border border-border/70 bg-surface p-3 shadow-card">
            <WheelDrum hourLabel="小时 (HH)" minuteLabel="分钟 (MM)">
              <WheelStaticColumn center={hour} modulus={24} />
              <WheelStaticColumn center={minute} modulus={60} />
            </WheelDrum>
          </div>

          <div className="mt-auto divide-y divide-border border-t border-border bg-surface px-6 text-xs text-fg">
            <div className="flex items-center justify-between py-3">
              <span className="text-fg-muted">重复频率</span>
              <span className="flex items-center gap-1 text-fg-subtle">
                工作日 <ChevronRight className="size-3" />
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-fg-muted">铃声提示</span>
              <span className="flex items-center gap-1 text-fg-subtle">
                雷达 <ChevronRight className="size-3" />
              </span>
            </div>
          </div>

          <div className="absolute top-[4.25rem] right-4 z-20 rounded-full border border-border/60 bg-surface/90 px-2 py-0.5 font-mono text-[10px] text-fg-muted shadow-sm backdrop-blur-sm">
            locked: {formatTimeString(hour, minute)}
          </div>
        </div>
      </div>
    </div>
  );
}
