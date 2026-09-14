import { useEffect, useRef, useState } from "react";
import {
  AlertOctagon,
  ArrowRight,
  Check,
  ChevronsRight,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  calcDampedOffset,
  calcMaxTravel,
  calcSlideProgress,
  calcTextOpacity,
  isThresholdReached,
  type SlideState,
} from "./lib/machines";

import "./slide.css";

interface Scenario {
  id: string;
  name: string;
  desc: string;
  prompt: string;
  danger: boolean;
}

const SCENARIOS: Scenario[] = [
  {
    id: "destroy",
    name: "销毁生产服务器",
    desc: "将断开所有网络连接并彻底格式化挂载的数据盘，不可逆。",
    prompt: "滑动以确认销毁",
    danger: true,
  },
  {
    id: "transfer",
    name: "大额跨境汇款 ¥50,000",
    desc: "向境外未验证收款人汇款，电汇指令一经发送无法拦截。",
    prompt: "滑动以确认汇款",
    danger: false,
  },
  {
    id: "wipe",
    name: "注销主账号与数据",
    desc: "清除所有用户档案、授权许可与历史账单，永久不可恢复。",
    prompt: "滑动以确认注销",
    danger: true,
  },
];

interface LogEntry {
  id: number;
  time: string;
  scenario: string;
  result: "committed" | "rollback";
  progress: number;
}

export function StudyView() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [threshold, setThreshold] = useState(0.85);
  const [resetDuration, setResetDuration] = useState(300); // ms
  const [enableDamping, setEnableDamping] = useState(true);

  const [state, setState] = useState<SlideState>("idle");
  const [rawDx, setRawDx] = useState(0);
  const [trackWidth, setTrackWidth] = useState(380);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const resetTimer = useRef<number | null>(null);
  const thumbWidth = 48; // px

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
        : enableDamping
          ? calcDampedOffset(rawDx, maxTravel)
          : Math.min(Math.max(0, rawDx), maxTravel);

  const progress = calcSlideProgress(visualOffset, maxTravel);
  const textOpacity = state === "committed" ? 0 : calcTextOpacity(progress);
  const thresholdReached = isThresholdReached(progress, threshold);

  function logAction(result: "committed" | "rollback", pct: number) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setLogs((prev) => [
      {
        id: Date.now(),
        time: timeStr,
        scenario: selectedScenario.name,
        result,
        progress: Math.round(pct * 100),
      },
      ...prev.slice(0, 7),
    ]);
  }

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
    if (isThresholdReached(curProgress, threshold)) {
      setState("committed");
      setRawDx(maxTravel);
      logAction("committed", curProgress);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
    } else {
      setState("resetting");
      setRawDx(0);
      logAction("rollback", curProgress);
      resetTimer.current = window.setTimeout(() => {
        setState("idle");
        resetTimer.current = null;
      }, resetDuration);
    }
  }

  function handleReset() {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    setState("resetting");
    setRawDx(0);
    resetTimer.current = window.setTimeout(() => {
      setState("idle");
      resetTimer.current = null;
    }, resetDuration);
  }

  function handleScenarioChange(sc: Scenario) {
    setSelectedScenario(sc);
    handleReset();
  }

  return (
    <div className="page-width py-10 space-y-12">
      {/* 核心设问与交互教具区 */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* 左侧：可操作滑动展台 */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <ShieldAlert className="size-4" />
                </span>
                <h2 className="text-[15px] font-semibold text-fg">高危门禁展台</h2>
              </div>
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] text-fg-subtle">
                门限: {Math.round(threshold * 100)}%
              </span>
            </div>

            {/* 场景卡片 */}
            <div className="mt-6 rounded-2xl border border-border/80 bg-surface-2/60 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    selectedScenario.danger
                      ? "bg-wrong/10 text-wrong"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <AlertOctagon className="size-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-fg tracking-tight">
                    {selectedScenario.name}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                    {selectedScenario.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* 滑块核心交互区 */}
            <div className="mt-8">
              <div
                ref={trackRef}
                className="relative flex h-14 w-full items-center overflow-hidden rounded-full border border-border bg-surface-2 p-1 touch-none"
              >
                {/* 动态进度填充 */}
                <div
                  className={`absolute left-1 top-1 bottom-1 rounded-full transition-colors duration-200 ${
                    state === "committed"
                      ? selectedScenario.danger
                        ? "bg-wrong/20"
                        : "bg-accent/25"
                      : thresholdReached
                        ? selectedScenario.danger
                          ? "bg-wrong/25"
                          : "bg-accent/30"
                        : "bg-accent/15"
                  }`}
                  style={{
                    width: `${visualOffset + thumbWidth}px`,
                    transition:
                      state === "resetting"
                        ? `width ${resetDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
                        : state === "committed"
                          ? "width 180ms cubic-bezier(0.25, 1, 0.5, 1)"
                          : "none",
                  }}
                />

                {/* 阈值标记刻度线 */}
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-fg/20 z-10"
                  style={{ left: `${4 + threshold * maxTravel + thumbWidth / 2}px` }}
                  title={`临界阈值: ${Math.round(threshold * 100)}%`}
                />

                {/* 提示文案 */}
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[13px] font-medium tracking-wide text-fg-muted"
                  style={{
                    opacity: textOpacity,
                    transition:
                      state === "resetting"
                        ? `opacity ${resetDuration}ms ease`
                        : state === "committed"
                          ? "opacity 150ms ease"
                          : "none",
                  }}
                >
                  <span className="relative overflow-hidden">
                    {selectedScenario.prompt}
                    {state === "idle" && (
                      <span
                        aria-hidden="true"
                        className="animate-slide-sheen absolute inset-0 bg-gradient-to-r from-transparent via-fg/20 to-transparent"
                      />
                    )}
                  </span>
                </div>

                {/* 抓手 */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`absolute left-1 top-1 bottom-1 size-12 rounded-full flex items-center justify-center text-white shadow-md cursor-grab active:cursor-grabbing transition-transform select-none ${
                    state === "committed"
                      ? selectedScenario.danger
                        ? "bg-wrong text-white"
                        : "bg-accent text-surface"
                      : thresholdReached
                        ? selectedScenario.danger
                          ? "bg-wrong"
                          : "bg-accent"
                        : "bg-fg text-surface"
                  }`}
                  style={{
                    transform: `translateX(${visualOffset}px)`,
                    transition:
                      state === "resetting"
                        ? `transform ${resetDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
                        : state === "committed"
                          ? "transform 180ms cubic-bezier(0.25, 1, 0.5, 1)"
                          : "none",
                  }}
                >
                  {state === "committed" ? (
                    <Check className="size-5" />
                  ) : (
                    <ChevronsRight className="size-5 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* 状态指示器与进度读数 */}
            <div className="mt-4 flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block size-2 rounded-full ${
                    state === "committed"
                      ? "bg-accent animate-ping"
                      : state === "dragging"
                        ? "bg-fg"
                        : "bg-border-strong"
                  }`}
                />
                <span className="font-mono text-fg-subtle">
                  {state === "committed"
                    ? "操作已锁定并执行"
                    : state === "dragging"
                      ? `行程: ${Math.round(progress * 100)}% · ${
                          thresholdReached ? "达到承诺线" : "未达临界线"
                        }`
                      : "按住抓手向右滑到底"}
                </span>
              </div>

              {state === "committed" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-accent hover:bg-surface-2 transition-colors"
                >
                  <RotateCcw className="size-3" />
                  <span>复位重试</span>
                </button>
              )}
            </div>
          </div>

          {/* 底部场景切换标签 */}
          <div className="mt-8 border-t border-border/70 pt-4">
            <span className="text-[11px] font-medium text-fg-subtle">切换业务情境:</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleScenarioChange(sc)}
                  className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    selectedScenario.id === sc.id
                      ? "bg-fg text-surface shadow-xs"
                      : "bg-surface-2 text-fg-muted hover:text-fg hover:bg-border/60"
                  }`}
                >
                  {sc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：参数调优与裁决日志 */}
        <div className="space-y-6">
          {/* 参数面板 */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <Sliders className="size-4 text-accent" />
              <h3 className="text-[14px] font-semibold text-fg">物理参数控制</h3>
            </div>

            <div className="mt-4 space-y-4 text-[13px]">
              {/* 临界阈值调节 */}
              <div>
                <div className="flex items-center justify-between text-fg-muted mb-1.5">
                  <span>确认临界阈值 (Commit Threshold)</span>
                  <span className="font-mono text-fg font-medium">
                    {Math.round(threshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
                <p className="mt-1 text-[11px] text-fg-subtle">
                  推荐 85%：过低易误触，过高在小屏易贴边难以触达。
                </p>
              </div>

              {/* 回弹时长 */}
              <div>
                <div className="flex items-center justify-between text-fg-muted mb-1.5">
                  <span>未达阈值复位时间 (Spring Rollback)</span>
                  <span className="font-mono text-fg font-medium">{resetDuration}ms</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="600"
                  step="50"
                  value={resetDuration}
                  onChange={(e) => setResetDuration(parseInt(e.target.value, 10))}
                  className="w-full accent-accent"
                />
              </div>

              {/* 阻尼开关 */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <div>
                  <span className="font-medium text-fg">末端阻尼衰减</span>
                  <p className="text-[11px] text-fg-subtle">
                    滑出右端或向左反拉时应用橡皮筋非线性阻抗
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableDamping(!enableDamping)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    enableDamping
                      ? "bg-accent-soft text-accent border border-accent/40"
                      : "bg-surface-2 text-fg-subtle border border-border"
                  }`}
                >
                  {enableDamping ? "启用中" : "已截断"}
                </button>
              </div>
            </div>
          </div>

          {/* 实时裁决与审计记录 */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="text-[14px] font-semibold text-fg">交互裁决记录</h3>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-[11px] text-fg-subtle hover:text-fg"
                >
                  清空
                </button>
              )}
            </div>

            <div className="mt-3">
              {logs.length === 0 ? (
                <p className="py-6 text-center text-[12px] text-fg-subtle">
                  尝试滑动左侧滑块，观察中途松手与达标锁定的裁决差异。
                </p>
              ) : (
                <ul className="space-y-2">
                  {logs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between rounded-xl bg-surface-2/70 px-3 py-2 text-[12px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-fg-subtle">{log.time}</span>
                        <span className="font-medium text-fg">{log.scenario}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-fg-muted">
                          {log.progress}%
                        </span>
                        {log.result === "committed" ? (
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                            已确认
                          </span>
                        ) : (
                          <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle">
                            回弹撤销
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 规则辨析与对比图谱 */}
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-4 text-accent" />
          <h2 className="text-[15px] font-semibold text-fg">决策图谱对照与辨析</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-[13px]">
          <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-4">
            <h4 className="font-semibold text-fg flex items-center gap-1.5">
              <span>对照 confirm-taxonomy</span>
              <ArrowRight className="size-3 text-accent" />
            </h4>
            <p className="mt-2 text-fg-muted leading-relaxed">
              确认阶梯（二次确认）从气泡、点击到弹窗探讨认知摩擦；滑动确认则是物理位移承诺，属于最重阶梯之上的不可逆高危门禁。
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-4">
            <h4 className="font-semibold text-fg flex items-center gap-1.5">
              <span>对照 swipe-action</span>
              <ArrowRight className="size-3 text-accent" />
            </h4>
            <p className="mt-2 text-fg-muted leading-relaxed">
              列表侧滑是在多行密集信息流中消歧滚动并露出快捷动作；滑动确认是针对单项破坏性决定的单向单一阈值闭环裁决。
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-4">
            <h4 className="font-semibold text-fg flex items-center gap-1.5">
              <span>对照 drag-commit</span>
              <ArrowRight className="size-3 text-accent" />
            </h4>
            <p className="mt-2 text-fg-muted leading-relaxed">
              拖拽提交强调的是二维空间落位、放置目标与条目重排；滑动确认是一维沿轨道的标量位移承诺。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
