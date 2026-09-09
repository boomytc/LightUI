import { useState, useRef, type PointerEvent as ReactPointerEvent } from "react";
import {
  Check,
  CheckCheck,
  Compass,
  Copy,
  Layers,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { useLocale } from "./lib/site-locale";
import {
  calcDragOffset,
  DEFAULT_ACTIONS_WIDTH,
  DEFAULT_COMMIT_THRESHOLD,
  DEFAULT_LOCK_THRESHOLD,
  resolveGestureLock,
  resolveSwipeRelease,
  type GestureLockAxis,
} from "./lib/machines";
import { FORMULA, INITIAL_MESSAGES, type MessageItem } from "./lib/kinds";
import { cn } from "./lib/utils";

export function StudyView() {
  const locale = useLocale();
  const [items, setItems] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [enableOverswipeCommit, setEnableOverswipeCommit] = useState(true);
  const [lockThresholdPx, setLockThresholdPx] = useState(DEFAULT_LOCK_THRESHOLD);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Live gesture telemetry
  const [telemetry, setTelemetry] = useState<{
    activeRowId: string | null;
    dx: number;
    dy: number;
    axis: GestureLockAxis;
    currentX: number;
  }>({
    activeRowId: null,
    dx: 0,
    dy: 0,
    axis: "undecided",
    currentX: 0,
  });

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  }

  function handleMarkRead(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unread: !it.unread } : it)),
    );
    setOpenRowId(null);
    showToast(locale === "en" ? "Toggled read status" : "已切换已读状态");
  }

  function handleDelete(id: string, isOverswipe = false) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setOpenRowId(null);
    showToast(
      isOverswipe
        ? (locale === "en" ? "Overswiped to delete item" : "全滑一步直接删除！")
        : (locale === "en" ? "Deleted message row" : "已删除该条消息"),
    );
  }

  function copyPrompt() {
    const text = locale === "en" ? FORMULA.prompt.en : FORMULA.prompt.zh;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-12">
      {/* Educational Header Banner */}
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                Study 5218
              </span>
              <span className="text-xs font-mono text-fg-subtle">Gesture · Disambiguation · Commit</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-fg">
              {locale === "en" ? "Swipe Action · Axis Disambiguation & Overswipe" : "列表侧滑 · 横竖意图消歧与全滑提交"}
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-2xl leading-relaxed">
              {locale === "en"
                ? "Swiping a list row horizontally requires precise 2-axis gesture disambiguation before locking. Once released, the gesture resolves between spring rollback, action tray latching, and direct overswipe deletion."
                : "列表行向左侧滑时，8px 矢量消歧区分纵向滚动与横向侧滑；释放时依据位移与阻尼裁定回弹、吸附露出快捷操作，或超过深滑阈值直接全滑提交删除。"}
            </p>
          </div>

          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-medium text-fg shadow-xs hover:bg-surface active:scale-95 transition-all"
          >
            {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
            <span>{copied ? (locale === "en" ? "Copied Prompt" : "已复制提示词") : (locale === "en" ? "Copy AI Prompt" : "复制 AI 提示词")}</span>
          </button>
        </div>

        {/* The Core Formula Bar */}
        <div className="mt-6 rounded-2xl border border-border/80 bg-surface-2/60 p-4">
          <p className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider">
            {locale === "en" ? "Interaction Formula: Name + Gesture + Result" : "交互公式：控件名称 + 触发手势 + 展开结果"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
            <span className="rounded-lg bg-surface px-2.5 py-1 border border-border shadow-xs text-accent">
              {locale === "en" ? FORMULA.name.en : FORMULA.name.zh}
            </span>
            <span className="text-fg-subtle">+</span>
            <span className="rounded-lg bg-surface px-2.5 py-1 border border-border shadow-xs">
              {locale === "en" ? FORMULA.gesture.en : FORMULA.gesture.zh}
            </span>
            <span className="text-fg-subtle">+</span>
            <span className="rounded-lg bg-surface px-2.5 py-1 border border-border shadow-xs">
              {locale === "en" ? FORMULA.result.en : FORMULA.result.zh}
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Phone Stage */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-[38px] border border-border bg-surface p-4 shadow-2xl relative">
            {/* Phone Speaker Notch */}
            <div className="absolute top-2 left-1/2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-border/40" />

            <div className="relative rounded-[28px] bg-surface-2 border border-border/50 overflow-hidden flex flex-col h-[520px]">
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-medium text-fg-muted">
                <span className="tabular-nums">9:41</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Inbox Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-border/60 bg-surface">
                <div>
                  <h3 className="text-sm font-semibold text-fg">消息中心</h3>
                  <p className="text-[10px] text-fg-muted mt-0.5">向左侧滑尝试两种阈值</p>
                </div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {items.filter((i) => i.unread).length} 未读
                </span>
              </div>

              {/* Message List */}
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setOpenRowId(null);
                  }
                }}
                className="flex-1 overflow-y-auto divide-y divide-border/60 bg-surface"
              >
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                    <p className="text-xs text-fg-muted">已清空所有演示消息</p>
                    <button
                      type="button"
                      onClick={() => setItems(INITIAL_MESSAGES)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-contrast shadow-xs hover:opacity-90"
                    >
                      <RotateCcw className="size-3" />
                      <span>恢复演示数据</span>
                    </button>
                  </div>
                ) : (
                  items.map((msg) => (
                    <InteractiveSwipeRow
                      key={msg.id}
                      item={msg}
                      isOpen={openRowId === msg.id}
                      onOpen={() => setOpenRowId(msg.id)}
                      onClose={() => setOpenRowId((curr) => (curr === msg.id ? null : curr))}
                      onTouchRow={() => setOpenRowId((curr) => (curr === msg.id ? curr : null))}
                      onMarkRead={() => handleMarkRead(msg.id)}
                      onDelete={(isOverswipe) => handleDelete(msg.id, isOverswipe)}
                      enableOverswipe={enableOverswipeCommit}
                      lockThreshold={lockThresholdPx}
                      onTelemetry={(data) => setTelemetry((prev) => ({ ...prev, ...data }))}
                    />
                  ))
                )}
              </div>

              {/* Toast message simulation inside phone */}
              {toastMessage && (
                <div className="absolute bottom-12 left-6 right-6 z-40 rounded-xl bg-fg/90 py-2 px-3 text-center text-xs font-medium text-bg shadow-lg backdrop-blur-sm animate-fade-in">
                  {toastMessage}
                </div>
              )}

              {/* Bottom Nav Simulation */}
              <div className="mt-auto border-t border-border bg-surface px-6 py-2.5 flex items-center justify-around text-xs text-fg-muted">
                <span className="text-accent font-semibold">消息</span>
                <span>通讯录</span>
                <span>工作台</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-fg-subtle text-center max-w-xs">
            {locale === "en"
              ? "Swipe row left. Releasing after 45% latches open. Swiping past 172px directly executes overswipe deletion."
              : "按住消息行向左滑。拉过 45% 吸附露出按钮；滑过 172px 浅红变深红，松手直接删除。"}
          </p>
        </div>

        {/* Right / Controls & Live Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Gesture Telemetry Display */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="size-3.5" />
                <span>实时手势矢量与锁轴消歧 (Gesture Telemetry)</span>
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold",
                  telemetry.axis === "horizontal"
                    ? "bg-accent-soft text-accent"
                    : telemetry.axis === "vertical"
                      ? "bg-amber-500/15 text-amber-600"
                      : "bg-surface-2 text-fg-subtle",
                )}
              >
                axis: {telemetry.axis}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <span className="text-fg-subtle text-[10px] block">ΔX 水平位移</span>
                <span className="text-sm font-bold text-fg mt-0.5 block">{telemetry.dx}px</span>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <span className="text-fg-subtle text-[10px] block">ΔY 垂直位移</span>
                <span className="text-sm font-bold text-fg mt-0.5 block">{telemetry.dy}px</span>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <span className="text-fg-subtle text-[10px] block">当前偏移量</span>
                <span className="text-sm font-bold text-accent mt-0.5 block">{telemetry.currentX}px</span>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <span className="text-fg-subtle text-[10px] block">生效行 ID</span>
                <span className="text-sm font-bold text-fg mt-0.5 block">
                  {telemetry.activeRowId ?? "无手势"}
                </span>
              </div>
            </div>

            {/* Visual Threshold Track */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-[11px] text-fg-muted mb-1.5">
                <span>0px (闭合)</span>
                <span>-66px (吸附门槛 45%)</span>
                <span>-148px (按钮完全露出)</span>
                <span className="text-wrong font-semibold">-172px (深滑提交删除)</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-surface-2 overflow-hidden border border-border">
                {/* Latch zone */}
                <div className="absolute left-[38%] right-[22%] inset-y-0 bg-accent/20" />
                {/* Commit zone */}
                <div className="absolute right-0 w-[22%] inset-y-0 bg-wrong/30" />
                {/* Indicator thumb */}
                <div
                  className="absolute top-0 bottom-0 w-2 rounded-full bg-accent shadow-xs transition-all"
                  style={{
                    left: `${Math.min(100, Math.max(0, (Math.abs(telemetry.currentX) / 220) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Physics Settings */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">
              {locale === "en" ? "Gesture Tuning Parameters" : "手势判定与行为参数调优"}
            </h3>

            {/* Toggle Overswipe Commit */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border/80">
              <div>
                <p className="text-xs font-semibold text-fg flex items-center gap-1.5">
                  <Zap className="size-3.5 text-accent" />
                  <span>深滑全滑直接删除 (Overswipe Full Commit)</span>
                </p>
                <p className="text-[11px] text-fg-muted mt-0.5">
                  向左滑动超过 172px 阈值时，无需二次点击按钮，松手一步提交删除
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableOverswipeCommit((v) => !v)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  enableOverswipeCommit ? "bg-accent" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    enableOverswipeCommit ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            {/* Threshold Radio buttons */}
            <div>
              <p className="text-xs font-medium text-fg mb-2">手势死区与消歧门限 (Disambiguation Deadband)：</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { px: 0, label: "0px (无消歧，极易误触)" },
                  { px: 8, label: "8px (标准推荐，扎实跟手)" },
                  { px: 20, label: "20px (大死区，偏迟钝)" },
                ].map((item) => (
                  <button
                    key={item.px}
                    type="button"
                    onClick={() => setLockThresholdPx(item.px)}
                    className={cn(
                      "rounded-xl border p-2 text-left text-xs font-medium transition-all",
                      lockThresholdPx === item.px
                        ? "border-accent bg-accent-soft text-accent shadow-xs"
                        : "border-border bg-surface-2 text-fg-muted hover:bg-surface",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Three Core Rules */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="size-3.5" />
              <span>{locale === "en" ? "Three Architectural Tenets of List Swipe" : "列表侧滑的三大架构要点"}</span>
            </h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
                <p className="font-semibold text-fg">1. 8px 矢量消歧与锁轴</p>
                <p className="mt-1 text-fg-muted leading-relaxed">
                  手指向下滑动浏览时不该被横滑拦截；手指轻微颤抖不触发。仅当欧氏位移达 8px 且横向位移占优时，才捕获指针阻止原生滚动。
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
                <p className="font-semibold text-fg">2. 双阈值：露出 vs 提交</p>
                <p className="mt-1 text-fg-muted leading-relaxed">
                  滑过 45% 吸附展开两个按钮（标记已读/删除）；若手指继续深拉超 172px，动作区全宽变红，松手直接提交，无需第二击。
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
                <p className="font-semibold text-fg">3. 单行排他与点外收回</p>
                <p className="mt-1 text-fg-muted leading-relaxed">
                  同一屏幕最多只允许一行处于展开态。触碰或滑动另一行时，已展开的行立即弹性回弹；点击展开行的正面区域直接闭合。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveSwipeRow({
  item,
  isOpen,
  onOpen,
  onClose,
  onTouchRow,
  onMarkRead,
  onDelete,
  enableOverswipe,
  lockThreshold,
  onTelemetry,
}: {
  item: MessageItem;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTouchRow: () => void;
  onMarkRead: () => void;
  onDelete: (isOverswipe: boolean) => void;
  enableOverswipe: boolean;
  lockThreshold: number;
  onTelemetry: (data: {
    activeRowId: string | null;
    dx: number;
    dy: number;
    axis: GestureLockAxis;
    currentX: number;
  }) => void;
}) {
  const [x, setX] = useState(isOpen ? -DEFAULT_ACTIONS_WIDTH : 0);
  const [isSettling, setIsSettling] = useState(true);

  const didDragRef = useRef(false);
  const dragEndTimeRef = useRef(0);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    axis: GestureLockAxis;
  } | null>(null);

  // Sync external open state
  const prevOpen = useRef(isOpen);
  if (prevOpen.current !== isOpen) {
    prevOpen.current = isOpen;
    setIsSettling(true);
    setX(isOpen ? -DEFAULT_ACTIONS_WIDTH : 0);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    onTouchRow();
    didDragRef.current = false;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: isOpen ? -DEFAULT_ACTIONS_WIDTH : 0,
      axis: "undecided",
    };
    setIsSettling(false);
    onTelemetry({
      activeRowId: item.id,
      dx: 0,
      dy: 0,
      axis: "undecided",
      currentX: isOpen ? -DEFAULT_ACTIONS_WIDTH : 0,
    });
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Disambiguation
    if (drag.axis === "undecided") {
      const axis = resolveGestureLock(dx, dy, lockThreshold);
      drag.axis = axis;
      if (axis === "horizontal") {
        try {
          e.currentTarget.setPointerCapture(drag.pointerId);
        } catch {
          /* ignore */
        }
      }
    }

    if (drag.axis !== "horizontal") {
      onTelemetry({
        activeRowId: item.id,
        dx: Math.round(dx),
        dy: Math.round(dy),
        axis: drag.axis,
        currentX: x,
      });
      return;
    }

    didDragRef.current = true;
    e.preventDefault();
    const nextX = calcDragOffset(dx, drag.originX, enableOverswipe ? 220 : DEFAULT_ACTIONS_WIDTH);
    setX(nextX);

    onTelemetry({
      activeRowId: item.id,
      dx: Math.round(dx),
      dy: Math.round(dy),
      axis: "horizontal",
      currentX: Math.round(nextX),
    });
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    setIsSettling(true);

    if (didDragRef.current) {
      dragEndTimeRef.current = performance.now();
    }

    if (!drag || drag.axis !== "horizontal") {
      setX(isOpen ? -DEFAULT_ACTIONS_WIDTH : 0);
      onTelemetry({
        activeRowId: null,
        dx: 0,
        dy: 0,
        axis: "undecided",
        currentX: isOpen ? -DEFAULT_ACTIONS_WIDTH : 0,
      });
      return;
    }

    const commitThresh = enableOverswipe ? DEFAULT_COMMIT_THRESHOLD : 9999;
    const verdict = resolveSwipeRelease(x, DEFAULT_ACTIONS_WIDTH, commitThresh);

    if (verdict.action === "commit") {
      onDelete(true);
    } else if (verdict.action === "reveal") {
      setX(verdict.targetX);
      onOpen();
    } else {
      setX(0);
      onClose();
    }

    onTelemetry({
      activeRowId: null,
      dx: 0,
      dy: 0,
      axis: "undecided",
      currentX: verdict.targetX,
    });
  }

  const isOverswiped = enableOverswipe && x <= -DEFAULT_COMMIT_THRESHOLD;

  return (
    <div className="relative overflow-hidden bg-surface">
      {/* Underlay Action Buttons */}
      <div
        className="absolute inset-y-0 right-0 flex"
        style={{ width: isOverswiped ? "100%" : DEFAULT_ACTIONS_WIDTH }}
      >
        {!isOverswiped && (
          <button
            type="button"
            onClick={onMarkRead}
            className="flex flex-1 flex-col items-center justify-center bg-accent text-accent-contrast text-xs font-medium gap-1 hover:opacity-95"
          >
            <CheckCheck className="size-4" />
            <span>{item.unread ? "标记已读" : "设为未读"}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(false)}
          className={cn(
            "flex items-center justify-center text-white text-xs font-medium gap-1 transition-colors",
            isOverswiped ? "w-full bg-wrong text-sm font-semibold" : "flex-1 flex-col bg-wrong/90 hover:bg-wrong",
          )}
        >
          <Trash2 className="size-4" />
          <span>{isOverswiped ? "松手直接删除该项" : "删除"}</span>
        </button>
      </div>

      {/* Sliding Front Row Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          const now = performance.now();
          if (didDragRef.current || now - dragEndTimeRef.current < 300) {
            didDragRef.current = false;
            dragEndTimeRef.current = 0;
            e.stopPropagation();
            return;
          }
          if (isOpen) onClose();
        }}
        className={cn(
          "relative z-10 flex items-start gap-3 bg-surface px-4 py-3.5 select-none touch-pan-y cursor-grab active:cursor-grabbing",
          isSettling && "transition-transform duration-200 ease-out",
        )}
        style={{
          transform: `translate3d(${x}px, 0, 0)`,
        }}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border/80 font-bold text-xs text-accent">
          {item.avatarText}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-xs font-semibold text-fg">{item.sender}</p>
            <span className="text-[10px] text-fg-subtle">{item.time}</span>
          </div>
          <p className="truncate text-xs font-medium text-fg/90 mt-0.5">{item.subject}</p>
          <p className="truncate text-[11px] text-fg-muted mt-0.5">{item.preview}</p>
        </div>
        {item.unread && (
          <div className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
        )}
      </div>
    </div>
  );
}
