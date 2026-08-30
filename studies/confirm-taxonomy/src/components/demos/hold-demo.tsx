import { useRef, useState, type PointerEvent } from "react";
import { calculateHoldProgress, isHoldComplete } from "../../lib/machines";
import { cn } from "../../lib/utils";
import { MacWindow } from "../mac-window";

const HOLD_MS = 2000;

export function HoldDemo() {
  const [seed, setSeed] = useState(0);
  return <HoldInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function HoldInner({ onReset }: { onReset: () => void }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);
  const done = useRef(false);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    setHolding(false);
    if (!done.current) setProgress(0);
  };

  const begin = (event: PointerEvent<HTMLButtonElement>) => {
    if (deleted || done.current) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    start.current = performance.now();
    setHolding(true);

    const tick = (now: number) => {
      const elapsed = now - start.current;
      const p = calculateHoldProgress(elapsed, HOLD_MS);
      setProgress(p);

      if (isHoldComplete(elapsed, HOLD_MS)) {
        done.current = true;
        setDeleted(true);
        setHolding(false);
        setProgress(1);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
  };

  const bars = [24, 38, 55, 78, 62, 85, 45, 70, 92, 58, 75, 40, 68, 88, 52, 35, 60, 42];

  return (
    <MacWindow
      title="录音备忘录 · 访谈音频"
      eyebrow="Voice Memo / Recording"
      badge={
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-medium text-fg-muted border border-border">
          {deleted ? "录音已清除" : "正在录制 · 48 kHz"}
        </span>
      }
      onReset={onReset}
    >
      <div className="px-5 pt-4 pb-6">
        <h3 className="text-base font-semibold text-fg">用户访谈现场录音</h3>

        <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-fg p-4 text-surface shadow-card">
          {deleted && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-lg bg-wrong px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              已永久删除 30 秒访谈录音
            </div>
          )}

          <div className={cn("flex items-center justify-between text-[10px] text-surface/60", deleted && "mt-4")}>
            <span>用户体验访谈 07</span>
            <span>无损 WAV</span>
          </div>

          <div className="relative mt-3 h-20">
            <div className="flex h-full items-end justify-center gap-1">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-accent transition-all"
                  style={{ height: deleted ? "4px" : `${h}%` }}
                />
              ))}
            </div>
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-base font-semibold tabular-nums text-surface">
              {deleted ? "00:00:00" : "00:18:42"}
            </p>
          </div>
        </div>

        {!deleted && (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-fg">删除刚才 30 秒录音</p>
                <p className="mt-0.5 text-[11px] text-fg-muted">
                  00:18:12—00:18:42 · 删除后无法从云端恢复
                </p>
              </div>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-fg-subtle border border-border">
                防误触保护
              </span>
            </div>

            {/* Hold to Confirm Button */}
            <button
              type="button"
              onPointerDown={begin}
              onPointerUp={stop}
              onPointerCancel={stop}
              onLostPointerCapture={stop}
              onContextMenu={(e) => e.preventDefault()}
              className="relative mt-3.5 flex h-10 w-full select-none items-center justify-center overflow-hidden rounded-xl bg-wrong/90 text-xs font-semibold text-white shadow-sm transition-all hover:bg-wrong touch-none"
              aria-label="按住两秒删除录音"
            >
              {/* Animated Progress Fill */}
              <span
                className="pointer-events-none absolute inset-y-0 left-0 bg-wrong-soft/30 transition-all"
                style={{ width: `${progress * 100}%` }}
              />
              <span className="relative z-10 flex items-center gap-1.5">
                {holding ? `按住确认删除... (${Math.round(progress * 100)}%)` : "长按 2 秒删除这 30 秒"}
              </span>
            </button>

            <p className="mt-2 text-center text-[10px] font-mono text-fg-subtle">
              {holding ? "松手即取消，持续按满 2 秒才触发执行" : "移动端高频危险操作：时间门槛代替阻断弹窗"}
            </p>
          </div>
        )}
      </div>
    </MacWindow>
  );
}
