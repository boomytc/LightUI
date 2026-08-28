import { useState, useRef } from "react";
import { Check, FolderKanban, Download, Trash2, Share2 } from "lucide-react";
import { SELECTION_FORMULAS, type SelectionMode } from "./lib/kinds";
import {
  shouldCancelHold,
  toggleSelection,
  selectAll,
  clearSelection,
  PRESS_HOLD_DELAY_MS,
  DRIFT_TOLERANCE_PX,
} from "./lib/machines";
import { pick, useLocale } from "./lib/site-locale";
import { cn, SAMPLE_FILES } from "./lib/utils";

export function StudyView() {
  const locale = useLocale();

  const [mode, setMode] = useState<SelectionMode>("normal");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeLog, setActiveLog] = useState<string>(
    locale === "en" ? "Ready. Try holding an item for 0.5s or tap to open." : "准备就绪。按住任意项约 0.5 秒或单击打开。",
  );
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  // Gesture Tracking State
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [pressProgress, setPressProgress] = useState<number>(0);
  const [driftPx, setDriftPx] = useState<number>(0);

  const startCoord = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const pressStartTime = useRef<number>(0);

  function clearHoldTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    timerRef.current = null;
    progressAnimRef.current = null;
    setPressingId(null);
    setPressProgress(0);
    setDriftPx(0);
    startCoord.current = null;
  }

  function handlePointerDown(e: React.PointerEvent, fileId: string) {
    if (mode === "selecting") {
      // In selection mode, immediate tap toggles
      return;
    }
    clearHoldTimer();
    startCoord.current = { x: e.clientX, y: e.clientY };
    setPressingId(fileId);
    pressStartTime.current = Date.now();

    // Progress animation
    const updateProgress = () => {
      const elapsed = Date.now() - pressStartTime.current;
      const p = Math.min(1, elapsed / PRESS_HOLD_DELAY_MS);
      setPressProgress(p);
      if (p < 1) {
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }
    };
    progressAnimRef.current = requestAnimationFrame(updateProgress);

    // Timeout trigger for long press
    timerRef.current = window.setTimeout(() => {
      clearHoldTimer();
      setMode("selecting");
      setSelectedIds([fileId]);
      setActiveLog(
        locale === "en"
          ? `Held for ${PRESS_HOLD_DELAY_MS}ms: Activated multi-select mode on [${fileId}]`
          : `长按满 ${PRESS_HOLD_DELAY_MS}ms：成功激活批量选择模式，自动勾选 [${fileId}]`,
      );
    }, PRESS_HOLD_DELAY_MS);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!startCoord.current || !pressingId) return;
    const dx = e.clientX - startCoord.current.x;
    const dy = e.clientY - startCoord.current.y;
    const dist = Math.hypot(dx, dy);
    setDriftPx(Math.round(dist));

    if (shouldCancelHold(dx, dy)) {
      clearHoldTimer();
      setActiveLog(
        locale === "en"
          ? `Drifted ${Math.round(dist)}px > ${DRIFT_TOLERANCE_PX}px: Cancelled hold -> Converted to native scroll`
          : `位移 ${Math.round(dist)}px 超出容差 ${DRIFT_TOLERANCE_PX}px：立即注销长按，让路给滑屏浏览`,
      );
    }
  }

  function handlePointerUp(fileId: string) {
    if (mode === "selecting") {
      setSelectedIds((prev) => toggleSelection(prev, fileId));
      return;
    }
    const hadTimer = Boolean(timerRef.current);
    clearHoldTimer();

    if (hadTimer) {
      // Released before 480ms -> standard tap/open
      setOpenDetailId(fileId);
      setActiveLog(
        locale === "en"
          ? `Quick Tap on [${fileId}]: Opened item detail`
          : `短促单击 [${fileId}]：直接打开文件详情`,
      );
    }
  }

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does this press open the item, or activate multi-select mode?"
              : "列表中这一按，是直接打开还是激活批量选择？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Tap opens directly; holding stationary past 480ms activates selection mode and reveals checkboxes; scrolling cancels the hold immediately without false triggers."
              : "单击默认打开；按住超 480ms 且位移在容差内激活选择模式；滑动则立即注销长按转为滚动。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Try long-pressing an item on the phone screen below. Drag slightly to see gesture disambiguation."
            : "在下方手机屏幕上尝试长按文件。拖拽微小距离可观察手势消歧判定。"}
        </p>
      </section>

      {/* Main Interactive Stage */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Top telemetry bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted/40 px-5 py-3.5 text-[12px]">
          <div className="flex items-center gap-3">
            <span className="font-medium text-fg-muted">
              {locale === "en" ? "Current Mode:" : "当前模式:"}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-0.5 font-mono font-semibold",
                mode === "selecting"
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "bg-surface text-fg-muted border border-border",
              )}
            >
              {mode === "selecting"
                ? (locale === "en" ? "SELECTING (Multi-select Mode)" : "SELECTING (多选模式)")
                : (locale === "en" ? "NORMAL (Browsing Mode)" : "NORMAL (普通浏览)")}
            </span>
          </div>

          <div className="flex items-center gap-4 text-fg-muted">
            <span>
              {locale === "en" ? "Selected:" : "已勾选:"}{" "}
              <strong className="text-fg">{selectedIds.length}</strong> / {SAMPLE_FILES.length}
            </span>
            {mode === "selecting" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(selectAll(SAMPLE_FILES.map((f) => f.id)))}
                  className="text-accent hover:underline text-[11px]"
                >
                  {locale === "en" ? "Select All" : "全选"}
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("normal");
                    setSelectedIds(clearSelection());
                  }}
                  className="text-fg-muted hover:text-fg text-[11px]"
                >
                  {locale === "en" ? "Exit" : "退出模式"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dual Frame Playground */}
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Mobile Interactive Screen */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[340px] rounded-[36px] border-4 border-fg/20 bg-surface p-3 shadow-2xl">
              {/* Phone Header */}
              <div className="flex items-center justify-between px-3 pt-2 pb-3">
                {mode === "selecting" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("normal");
                      setSelectedIds(clearSelection());
                    }}
                    className="text-[12px] font-medium text-fg-muted hover:text-fg"
                  >
                    {locale === "en" ? "Cancel" : "取消"}
                  </button>
                ) : (
                  <span className="text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
                    {locale === "en" ? "Files" : "项目文件"}
                  </span>
                )}
                <h3 className="text-[14px] font-semibold text-fg">
                  {mode === "selecting"
                    ? (locale === "en" ? `Selected (${selectedIds.length})` : `已选择 (${selectedIds.length})`)
                    : (locale === "en" ? "All Documents" : "全部文档")}
                </h3>
                <span className="w-8" />
              </div>

              {/* File list container */}
              <div
                className="space-y-2 overflow-y-auto px-1 py-1 max-h-[340px]"
                onPointerMove={handlePointerMove}
              >
                {SAMPLE_FILES.map((file) => {
                  const isSelected = selectedIds.includes(file.id);
                  const isPressing = pressingId === file.id;

                  return (
                    <div
                      key={file.id}
                      onPointerDown={(e) => handlePointerDown(e, file.id)}
                      onPointerUp={() => handlePointerUp(file.id)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl border border-border p-3 select-none transition-all cursor-pointer",
                        isPressing && "scale-[0.98] bg-surface-muted border-accent/40",
                        isSelected ? "bg-accent/5 border-accent/40" : "bg-surface hover:bg-surface-muted/60",
                      )}
                    >
                      {/* Hold progress bar overlay */}
                      {isPressing && (
                        <div
                          className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl bg-accent transition-[width] duration-75"
                          style={{ width: `${pressProgress * 100}%` }}
                        />
                      )}

                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-accent">
                        <FolderKanban className="size-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-fg">{file.name}</p>
                        <p className="text-[11px] text-fg-muted">
                          {file.type} · {file.size}
                        </p>
                      </div>

                      {/* Checkbox badge only in selecting mode */}
                      {mode === "selecting" && (
                        <div
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                            isSelected
                              ? "border-accent bg-accent text-surface"
                              : "border-border bg-surface text-transparent",
                          )}
                        >
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Dock in selecting mode */}
              {mode === "selecting" ? (
                <div className="mt-3 flex items-center justify-around border-t border-border pt-3 text-[11px] text-fg-muted animate-in fade-in slide-in-from-bottom-2">
                  <button type="button" className="flex flex-col items-center gap-1 hover:text-fg">
                    <Download className="size-4" />
                    <span>{locale === "en" ? "Download" : "下载"}</span>
                  </button>
                  <button type="button" className="flex flex-col items-center gap-1 hover:text-fg">
                    <Share2 className="size-4" />
                    <span>{locale === "en" ? "Share" : "分享"}</span>
                  </button>
                  <button type="button" className="flex flex-col items-center gap-1 text-rose-600 hover:opacity-80">
                    <Trash2 className="size-4" />
                    <span>{locale === "en" ? "Delete" : "删除"}</span>
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-center text-[11px] text-fg-subtle">
                  {locale === "en"
                    ? "Hold ~0.5s to multi-select · Tap to open"
                    : "长按约 0.5s 进入多选 · 单击直接打开"}
                </p>
              )}
            </div>
          </div>

          {/* Telemetry Log & Details */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-muted/40 p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                {locale === "en" ? "Realtime Gesture Log & Verdict" : "手势判定与轨迹日志"}
              </p>

              <div className="mt-3 rounded-lg border border-border bg-surface p-3 font-mono text-[12px] leading-relaxed text-fg">
                <span className="text-accent font-semibold">{"> "}</span>
                {activeLog}
              </div>

              <div className="mt-4 space-y-2.5 font-mono text-[12px]">
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">hold_threshold</span>
                  <span className="font-semibold text-fg">480 ms</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">drift_tolerance</span>
                  <span className="font-semibold text-fg">8 px (64 px²)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">active_drift</span>
                  <span className={cn("font-semibold", driftPx > 8 ? "text-rose-600 font-bold" : "text-fg")}>
                    {driftPx} px
                  </span>
                </div>
              </div>

              {openDetailId && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-[12px] text-emerald-700 dark:text-emerald-300">
                  <span>
                    {locale === "en" ? `Previewing: ${openDetailId}` : `已打开查看: ${openDetailId}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenDetailId(null)}
                    className="hover:underline text-[11px]"
                  >
                    {locale === "en" ? "Close" : "关闭"}
                  </button>
                </div>
              )}
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-fg-muted">
              {locale === "en"
                ? "Disambiguates tap from long-press and drag. Permanent checkboxes are omitted for maximum mobile readability."
                : "通过时间累积与位移容差精准区分单击、长按与滑动。移动端不常驻勾选框，保障最高的信息浏览密度。"}
            </p>
          </div>
        </div>
      </div>

      {/* Formula Cards */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {SELECTION_FORMULAS.map((item) => (
          <div key={item.id} className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
                {pick(item.eyebrow, locale)}
              </p>
              <h3 className="mt-1 text-[14px] font-semibold text-fg">{pick(item.title, locale)}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{pick(item.desc, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Distinctions */}
      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "Platform Paradigm Differences" : "平台范式与手势裁决"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Desktop vs Mobile Selection" : "1. 桌面端常驻 vs 移动端按需模式"}
              </span>
              <br />
              {locale === "en"
                ? "Desktop has high pointer precision and wide viewports. Mobile uses long-press to prevent layout clutter and accidental clicks."
                : "桌面端鼠标指针精度高、屏幕宽，复选框常驻；移动端手指面积大、屏幕窄，采用长按按需唤出多选模式。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Displacement tolerance for touch" : "2. 位移容差避免手势打架"}
              </span>
              <br />
              {locale === "en"
                ? "Micro-tremors within 8px are tolerated. Larger movements immediately yield control to native scroll."
                : "8px 内的轻微颤抖被容忍；超过 8px 立即判为滑屏，避免长按定时器吞掉用户的滚动意图。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            Gesture Disambiguation Machine
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`onPointerDown = (e) => {
  timer = setTimeout(enterSelectMode, 480);
};

onPointerMove = (e) => {
  if (dx * dx + dy * dy > 64) {
    clearTimeout(timer); // 释放给原生滚动
  }
};

onPointerUp = () => {
  if (timer) openDetail(); // 快速抬起 = 单击
};`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Strict thresholds keep tap, scroll, and multi-select distinct and intuitive."
              : "严格的时间与位移门限使单击、滚动与多选互不干扰。"}
          </p>
        </article>
      </section>
    </div>
  );
}
