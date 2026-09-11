import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CheckCheck, RotateCcw, Trash2 } from "lucide-react";
import { pick, useLocale } from "./lib/site-locale";
import {
  calcDragOffset,
  DEFAULT_ACTIONS_WIDTH,
  DEFAULT_COMMIT_THRESHOLD,
  DEFAULT_LOCK_THRESHOLD,
  DEFAULT_SNAP_RATIO,
  resolveGestureLock,
  resolveSwipeRelease,
  type GestureLockAxis,
  type SwipeReleaseVerdict,
} from "./lib/machines";
import { INITIAL_MESSAGES, SWIPE_FORMULAS, type MessageItem } from "./lib/kinds";
import { cn } from "./lib/utils";

const SETTLE_MS = 320;
const EXIT_MS = 260;
const TRACK_MAX_PX = 220;

type ReleaseKind = SwipeReleaseVerdict["action"] | "idle" | "scroll" | "pending";

type Telemetry = {
  activeRowId: string | null;
  dx: number;
  dy: number;
  axis: GestureLockAxis;
  currentX: number;
};

const IDLE_TELEMETRY: Telemetry = {
  activeRowId: null,
  dx: 0,
  dy: 0,
  axis: "undecided",
  currentX: 0,
};

export function StudyView() {
  const locale = useLocale();
  const t = (zh: string, en: string) => (locale === "en" ? en : zh);

  const [items, setItems] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [enableOverswipeCommit, setEnableOverswipeCommit] = useState(true);
  const [lockThresholdPx, setLockThresholdPx] = useState(DEFAULT_LOCK_THRESHOLD);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastVerdict, setLastVerdict] = useState<SwipeReleaseVerdict["action"] | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry>(IDLE_TELEMETRY);
  const toastTimer = useRef<number | null>(null);

  const latchPx = DEFAULT_ACTIONS_WIDTH * DEFAULT_SNAP_RATIO;
  const commitThresh = enableOverswipeCommit ? DEFAULT_COMMIT_THRESHOLD : 9999;

  const liveKind: ReleaseKind = !telemetry.activeRowId
    ? "idle"
    : telemetry.axis === "vertical"
      ? "scroll"
      : telemetry.axis === "undecided"
        ? "pending"
        : resolveSwipeRelease(telemetry.currentX, DEFAULT_ACTIONS_WIDTH, commitThresh).action;

  function showToast(msg: string) {
    setToastMessage(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2200);
  }

  function handleMarkRead(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unread: !it.unread } : it)),
    );
    setOpenRowId(null);
    showToast(t("已切换已读状态", "Toggled read status"));
  }

  function handleDelete(id: string, isOverswipe = false) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setOpenRowId(null);
    showToast(
      isOverswipe
        ? t("全滑一步直接删除", "Overswiped — deleted in one stroke")
        : t("已删除该条消息", "Deleted message row"),
    );
  }

  function handleReleaseVerdict(action: SwipeReleaseVerdict["action"]) {
    setLastVerdict(action);
  }

  const unread = items.filter((i) => i.unread).length;

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {t(
              "列表行向左侧滑时，手势如何区分横竖意图，并在露出与提交之间裁定？",
              "When swiping a row left, how do we lock the axis — and choose reveal versus commit?",
            )}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {t(
              "8px 矢量死区内不锁轴。纵占优放行滚动；横占优才侧滑。松手按位移裁定回弹、吸附露出，或越过 172px 深滑提交。",
              "Stay undecided inside an 8px vector deadband. Vertical wins yield to scroll; horizontal wins swipe. Release springs shut, snaps the tray, or commits past 172px.",
            )}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {t(
            "先在手机里向下滚，再向左拉一行。右侧罗盘看锁轴，尺子看松手会回弹、露出还是删除。",
            "Scroll the phone list down, then pull a row left. The compass shows the lock; the ruler shows close, reveal, or commit.",
          )}
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-2/70 px-5 py-3.5 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-fg-muted">{t("此刻裁定", "Live verdict")}</span>
            <VerdictChip kind={liveKind} last={lastVerdict} locale={locale} />
          </div>
          <div className="flex items-center gap-3 font-mono text-fg-muted">
            <span>
              axis <strong className="text-fg">{telemetry.axis}</strong>
            </span>
            <span className="text-border">·</span>
            <span>
              x <strong className="text-accent">{telemetry.currentX}</strong>px
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[340px] rounded-[36px] border-4 border-fg/20 bg-surface p-3 shadow-2xl">
              <div className="flex items-center justify-between px-3 pt-2 pb-3">
                <div>
                  <p className="text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
                    {t("Inbox", "Inbox")}
                  </p>
                  <h3 className="text-[14px] font-semibold text-fg">{t("消息中心", "Messages")}</h3>
                </div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {unread} {t("未读", "unread")}
                </span>
              </div>

              {telemetry.activeRowId && (
                <div
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-[4.35rem] z-30 -translate-x-1/2 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold shadow-xs backdrop-blur-sm transition-colors duration-150",
                    telemetry.axis === "horizontal"
                      ? "border-accent/30 bg-accent-soft text-accent"
                      : telemetry.axis === "vertical"
                        ? "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "border-border bg-surface/90 text-fg-muted",
                  )}
                >
                  {telemetry.axis === "horizontal"
                    ? t("横滑 · 已锁轴", "Horizontal · locked")
                    : telemetry.axis === "vertical"
                      ? t("纵滚 · 已放行", "Vertical · yielded")
                      : t("死区内 · 待定", "Deadband · pending")}
                </div>
              )}

              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) setOpenRowId(null);
                }}
                className="relative h-[360px] overflow-y-auto overflow-x-hidden rounded-2xl border border-border/70 bg-surface-2/50"
              >
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <p className="text-[12px] text-fg-muted">{t("演示列表已清空", "Demo inbox is empty")}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setItems(INITIAL_MESSAGES);
                        setLastVerdict(null);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-[12px] font-medium text-accent-fg shadow-xs hover:opacity-90"
                    >
                      <RotateCcw className="size-3" />
                      {t("恢复演示数据", "Restore demo rows")}
                    </button>
                  </div>
                ) : (
                  items.map((msg) => (
                    <InteractiveSwipeRow
                      key={msg.id}
                      item={msg}
                      locale={locale}
                      isOpen={openRowId === msg.id}
                      onOpen={() => setOpenRowId(msg.id)}
                      onClose={() => setOpenRowId((curr) => (curr === msg.id ? null : curr))}
                      onTouchRow={() => setOpenRowId((curr) => (curr === msg.id ? curr : null))}
                      onMarkRead={() => handleMarkRead(msg.id)}
                      onDelete={(isOverswipe) => handleDelete(msg.id, isOverswipe)}
                      onReleaseVerdict={handleReleaseVerdict}
                      enableOverswipe={enableOverswipeCommit}
                      lockThreshold={lockThresholdPx}
                      onTelemetry={(data) => setTelemetry((prev) => ({ ...prev, ...data }))}
                    />
                  ))
                )}
              </div>

              {toastMessage && (
                <div className="absolute inset-x-8 bottom-6 z-40 rounded-full bg-fg/92 px-3 py-2 text-center text-[11px] font-medium text-bg shadow-lg backdrop-blur-sm">
                  {toastMessage}
                </div>
              )}

              <p className="mt-3 text-center text-[11px] text-fg-subtle">
                {t("向下滚是浏览；向左拉过 45% 露出；过 172px 松手删除", "Scroll to browse · past 45% reveals · past 172px commits")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                    {t("8px 矢量消歧", "8px vector lock")}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                    {t(
                      "圆内待定。对角切开：左右楔是横滑，上下楔是纵滚。",
                      "Inside the circle: pending. Diagonals split swipe (east/west) from scroll (north/south).",
                    )}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-fg-subtle">
                  lock {lockThresholdPx}px
                </span>
              </div>
              <div className="mt-3 flex justify-center">
                <AxisCompass
                  dx={telemetry.dx}
                  dy={telemetry.dy}
                  axis={telemetry.axis}
                  lockPx={lockThresholdPx}
                  active={Boolean(telemetry.activeRowId)}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <Metric label="Δx" value={`${telemetry.dx}px`} />
                <Metric label="Δy" value={`${telemetry.dy}px`} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                {t("松手双阈值", "Release thresholds")}
              </p>
              <ThresholdRuler
                currentX={telemetry.currentX}
                latchPx={latchPx}
                commitPx={DEFAULT_COMMIT_THRESHOLD}
                enableCommit={enableOverswipeCommit}
                kind={liveKind}
                locale={locale}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-fg">{t("深滑直接提交", "Overswipe commits")}</p>
                  <p className="text-[11px] text-fg-muted">{t("越过 172px 松手即删，无需再点", "Past 172px, release deletes — no second tap")}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableOverswipeCommit}
                  onClick={() => setEnableOverswipeCommit((v) => !v)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
                    enableOverswipeCommit ? "bg-accent" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition duration-200",
                      enableOverswipeCommit ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              <div>
                <p className="mb-1.5 px-0.5 text-[11px] font-medium text-fg-muted">
                  {t("消歧死区对照（默认 8px 不变）", "Deadband contrast — default stays 8px")}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { px: 0, zh: "0 · 易误触", en: "0 · twitchy" },
                      { px: 8, zh: "8 · 推荐", en: "8 · default" },
                      { px: 20, zh: "20 · 迟钝", en: "20 · sluggish" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.px}
                      type="button"
                      onClick={() => setLockThresholdPx(item.px)}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-left text-[11px] font-medium transition-colors",
                        lockThresholdPx === item.px
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border bg-surface text-fg-muted hover:bg-surface-2",
                      )}
                    >
                      {locale === "en" ? item.en : item.zh}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {SWIPE_FORMULAS.map((item) => (
          <div key={item.id} className="flex flex-col rounded-xl border border-border bg-surface p-4">
            <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
              {pick(item.eyebrow, locale)}
            </p>
            <h3 className="mt-1 text-[14px] font-semibold text-fg">{pick(item.title, locale)}</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{pick(item.desc, locale)}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {t("两对裁定，不要混", "Two decisions, kept apart")}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">{t("1. 先锁轴，再谈位移", "1. Lock the axis before measuring travel")}</span>
              <br />
              {t(
                "死区内手指还在犹豫。纵占优必须把滚动交还给列表，不能因为晃了 3px 就劫持成侧滑。",
                "Inside the deadband the finger is still deciding. A vertical win must return native scroll — a 3px wobble must not steal the list.",
              )}
            </li>
            <li>
              <span className="font-medium text-fg">{t("2. 露出不是提交", "2. Reveal is not commit")}</span>
              <br />
              {t(
                "过 45% 只是把已读/删除吸附出来，还要再点一次。只有越过 172px，松手才等于删除。",
                "Past 45% only latches the tray — a second tap still needed. Only travel past 172px makes release itself the delete.",
              )}
            </li>
            <li>
              <span className="font-medium text-fg">{t("3. 一屏一行", "3. One open row")}</span>
              <br />
              {t(
                "滑第二行时第一行立刻回弹。点正面或空白是后悔通道，不必瞄准取消。",
                "Swiping a second row springs the first shut. Tapping the face or empty space is the undo — no cancel target required.",
              )}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            lock → release
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`dist = hypot(dx, dy)
if (dist < 8) axis = undecided
else axis = |dx| >= |dy| ? horizontal : vertical

onRelease:
  if (x <= -172) commit   // 深滑
  else if (x <= -148*0.45) reveal
  else close`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {t(
              "8 / 45% / 172 是机器里的数。教学面只把它们画出来，不改裁定。",
              "8, 45%, and 172 live in the machine. The playground only paints them — it does not retune the verdict.",
            )}
          </p>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
      <span className="text-fg-muted">{label}</span>
      <span className="font-semibold text-fg">{value}</span>
    </div>
  );
}

function VerdictChip({
  kind,
  last,
  locale,
}: {
  kind: ReleaseKind;
  last: SwipeReleaseVerdict["action"] | null;
  locale: "zh" | "en";
}) {
  const t = (zh: string, en: string) => (locale === "en" ? en : zh);
  const shown = kind === "idle" && last ? last : kind;
  const label =
    shown === "commit"
      ? t("提交删除", "Commit delete")
      : shown === "reveal"
        ? t("吸附露出", "Snap reveal")
        : shown === "close"
          ? t("回弹闭合", "Spring close")
          : shown === "scroll"
            ? t("纵滚放行", "Yield scroll")
            : shown === "pending"
              ? t("死区待定", "Deadband")
              : t("待机", "Idle");

  return (
    <span
      className={cn(
        "rounded-full border px-3 py-0.5 font-mono font-semibold",
        shown === "commit"
          ? "border-wrong/35 bg-wrong-soft text-wrong"
          : shown === "reveal"
            ? "border-accent/30 bg-accent-soft text-accent"
            : shown === "scroll"
              ? "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : shown === "close"
                ? "border-border bg-surface text-fg"
                : "border-border bg-surface text-fg-muted",
      )}
    >
      {kind === "idle" && last ? `${t("上次", "last")} · ${label}` : label}
    </span>
  );
}

function AxisCompass({
  dx,
  dy,
  axis,
  lockPx,
  active,
}: {
  dx: number;
  dy: number;
  axis: GestureLockAxis;
  lockPx: number;
  active: boolean;
}) {
  const size = 168;
  const c = size / 2;
  const maxR = 70;
  const scale = lockPx > 0 ? 28 / lockPx : 3.5;
  const deadR = Math.min(maxR - 8, Math.max(10, lockPx * scale));
  const vx = Math.max(-maxR, Math.min(maxR, dx * scale));
  const vy = Math.max(-maxR, Math.min(maxR, dy * scale));
  const locked = axis !== "undecided";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" aria-hidden>
      <defs>
        <clipPath id="swipe-compass-disk">
          <circle cx={c} cy={c} r={maxR} />
        </clipPath>
      </defs>
      <g clipPath="url(#swipe-compass-disk)">
        <polygon points={`${c},${c} ${c + maxR},${c - maxR} ${c + maxR},${c + maxR}`} fill="var(--color-accent)" opacity={axis === "horizontal" ? 0.18 : 0.06} />
        <polygon points={`${c},${c} ${c - maxR},${c - maxR} ${c - maxR},${c + maxR}`} fill="var(--color-accent)" opacity={axis === "horizontal" ? 0.18 : 0.06} />
        <polygon points={`${c},${c} ${c - maxR},${c - maxR} ${c + maxR},${c - maxR}`} fill="#d97706" opacity={axis === "vertical" ? 0.16 : 0.05} />
        <polygon points={`${c},${c} ${c - maxR},${c + maxR} ${c + maxR},${c + maxR}`} fill="#d97706" opacity={axis === "vertical" ? 0.16 : 0.05} />
      </g>
      <circle cx={c} cy={c} r={maxR} fill="var(--color-surface)" fillOpacity={0.2} stroke="var(--color-border-strong)" strokeWidth={1} />
      <line x1={c - maxR} y1={c} x2={c + maxR} y2={c} stroke="var(--color-border-strong)" strokeWidth={1} />
      <line x1={c} y1={c - maxR} x2={c} y2={c + maxR} stroke="var(--color-border-strong)" strokeWidth={1} />
      <line x1={c - maxR} y1={c - maxR} x2={c + maxR} y2={c + maxR} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="3 3" />
      <line x1={c - maxR} y1={c + maxR} x2={c + maxR} y2={c - maxR} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="3 3" />
      <circle
        cx={c}
        cy={c}
        r={deadR}
        fill="none"
        stroke={axis === "undecided" && active ? "var(--color-fg-subtle)" : "var(--color-border-strong)"}
        strokeWidth={axis === "undecided" && active ? 1.6 : 1}
        strokeDasharray={lockPx === 0 ? "2 3" : undefined}
      />
      <text x={c} y={c - deadR - 6} textAnchor="middle" fill="var(--color-fg-subtle)" fontSize="9" fontFamily="var(--font-mono)">
        {lockPx}px
      </text>
      <text x={c + maxR - 6} y={c - 6} textAnchor="end" fill="var(--color-accent)" fontSize="9">
        Δx
      </text>
      <text x={c + 6} y={c + maxR - 4} fill="#b45309" fontSize="9">
        Δy
      </text>
      {active && (
        <>
          <line
            x1={c}
            y1={c}
            x2={c + vx}
            y2={c + vy}
            stroke={axis === "horizontal" ? "var(--color-accent)" : axis === "vertical" ? "#d97706" : "var(--color-fg-muted)"}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle
            cx={c + vx}
            cy={c + vy}
            r={locked ? 5.5 : 4}
            fill={axis === "horizontal" ? "var(--color-accent)" : axis === "vertical" ? "#d97706" : "var(--color-fg-muted)"}
            className={active && !locked ? "swipe-compass-dot" : undefined}
          />
        </>
      )}
      {!active && <circle cx={c} cy={c} r={3} fill="var(--color-fg-subtle)" />}
    </svg>
  );
}

function ThresholdRuler({
  currentX,
  latchPx,
  commitPx,
  enableCommit,
  kind,
  locale,
}: {
  currentX: number;
  latchPx: number;
  commitPx: number;
  enableCommit: boolean;
  kind: ReleaseKind;
  locale: "zh" | "en";
}) {
  const t = (zh: string, en: string) => (locale === "en" ? en : zh);
  const absX = Math.min(TRACK_MAX_PX, Math.abs(Math.min(0, currentX)));
  const latchPct = (latchPx / TRACK_MAX_PX) * 100;
  const trayPct = (DEFAULT_ACTIONS_WIDTH / TRACK_MAX_PX) * 100;
  const commitPct = (commitPx / TRACK_MAX_PX) * 100;
  const thumbPct = (absX / TRACK_MAX_PX) * 100;

  return (
    <div className="mt-3">
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-border bg-surface">
        <div className="absolute inset-y-0 left-0 bg-fg/8" style={{ width: `${latchPct}%` }} />
        <div
          className="absolute inset-y-0 bg-accent/25"
          style={{ left: `${latchPct}%`, width: `${(enableCommit ? commitPct : 100) - latchPct}%` }}
        />
        {enableCommit && <div className="absolute inset-y-0 right-0 bg-wrong/30" style={{ left: `${commitPct}%` }} />}
        <div
          className={cn(
            "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-xs transition-[left,background-color] duration-75",
            kind === "commit" ? "bg-wrong" : kind === "reveal" ? "bg-accent" : "bg-fg",
          )}
          style={{ left: `${thumbPct}%` }}
        />
      </div>
      <div className="relative mt-2 h-8 text-[10px] text-fg-subtle">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2 text-accent" style={{ left: `${latchPct}%` }}>
          {t("45%", "45%")}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: `${trayPct}%` }}>
          148
        </span>
        {enableCommit && (
          <span className="absolute -translate-x-1/2 font-semibold text-wrong" style={{ left: `${commitPct}%` }}>
            172
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-[10px] leading-snug text-fg-muted">
        <p>{t("不到 45% → 回弹", "< 45% → close")}</p>
        <p className="text-center">{t("过门槛 → 露出", "latch → reveal")}</p>
        <p className="text-right">{enableCommit ? t("≥172 → 提交", "≥172 → commit") : t("提交已关", "commit off")}</p>
      </div>
    </div>
  );
}

function InteractiveSwipeRow({
  item,
  locale,
  isOpen,
  onOpen,
  onClose,
  onTouchRow,
  onMarkRead,
  onDelete,
  onReleaseVerdict,
  enableOverswipe,
  lockThreshold,
  onTelemetry,
}: {
  item: MessageItem;
  locale: "zh" | "en";
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTouchRow: () => void;
  onMarkRead: () => void;
  onDelete: (isOverswipe: boolean) => void;
  onReleaseVerdict: (action: SwipeReleaseVerdict["action"]) => void;
  enableOverswipe: boolean;
  lockThreshold: number;
  onTelemetry: (data: Telemetry) => void;
}) {
  const t = (zh: string, en: string) => (locale === "en" ? en : zh);
  const [x, setX] = useState(isOpen ? -DEFAULT_ACTIONS_WIDTH : 0);
  const [isSettling, setIsSettling] = useState(true);
  const [exiting, setExiting] = useState(false);

  const didDragRef = useRef(false);
  const dragEndTimeRef = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const exitTimer = useRef<number | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    axis: GestureLockAxis;
  } | null>(null);

  const prevOpen = useRef(isOpen);
  if (prevOpen.current !== isOpen && !exiting) {
    prevOpen.current = isOpen;
    setIsSettling(true);
    setX(isOpen ? -DEFAULT_ACTIONS_WIDTH : 0);
  }

  function beginExit(isOverswipe: boolean) {
    setExiting(true);
    setIsSettling(true);
    const width = rowRef.current?.getBoundingClientRect().width ?? 320;
    setX(-width);
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => onDelete(isOverswipe), EXIT_MS);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (exiting) return;
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
    if (!drag || exiting) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

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
    const nextX = calcDragOffset(dx, drag.originX, enableOverswipe ? TRACK_MAX_PX : DEFAULT_ACTIONS_WIDTH);
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
      onTelemetry(IDLE_TELEMETRY);
      return;
    }

    const commitThresh = enableOverswipe ? DEFAULT_COMMIT_THRESHOLD : 9999;
    const verdict = resolveSwipeRelease(x, DEFAULT_ACTIONS_WIDTH, commitThresh);
    onReleaseVerdict(verdict.action);

    if (verdict.action === "commit") {
      beginExit(true);
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
      currentX: verdict.action === "commit" ? verdict.targetX : verdict.targetX,
    });
  }

  const absX = Math.abs(Math.min(0, x));
  const isOverswiped = enableOverswipe && x <= -DEFAULT_COMMIT_THRESHOLD;
  const commitHeat = enableOverswipe
    ? Math.min(1, Math.max(0, (absX - DEFAULT_ACTIONS_WIDTH) / (DEFAULT_COMMIT_THRESHOLD - DEFAULT_ACTIONS_WIDTH)))
    : 0;
  const approaching = commitHeat > 0 && !isOverswiped;
  const rowW = rowRef.current?.getBoundingClientRect().width ?? 320;
  const trayWidth = exiting || isOverswiped
    ? rowW
    : DEFAULT_ACTIONS_WIDTH + commitHeat * Math.max(0, rowW - DEFAULT_ACTIONS_WIDTH);

  return (
    <div
      ref={rowRef}
      className={cn(
        "relative overflow-hidden border-b border-border/70 bg-surface transition-[max-height,opacity] ease-out",
        exiting ? "max-h-0 opacity-0" : "max-h-32 opacity-100",
      )}
      style={{
        transitionDuration: exiting ? `${EXIT_MS}ms` : isSettling ? `${SETTLE_MS}ms` : "0ms",
      }}
    >
      <div
        className="absolute inset-y-0 right-0 flex overflow-hidden"
        style={{
          width: trayWidth,
          transition: isSettling ? `width ${SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
        }}
      >
        {!isOverswiped && !exiting && (
          <button
            type="button"
            onClick={onMarkRead}
            className="flex flex-1 flex-col items-center justify-center gap-1 bg-accent text-[11px] font-medium text-accent-fg hover:opacity-95"
            style={{ opacity: approaching ? 1 - commitHeat : 1 }}
          >
            <CheckCheck className="size-4" />
            <span>{item.unread ? t("标记已读", "Read") : t("设为未读", "Unread")}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => beginExit(false)}
          className={cn(
            "flex items-center justify-center gap-1 font-medium text-white transition-colors",
            isOverswiped || exiting
              ? "w-full bg-wrong text-[13px] font-semibold"
              : "flex-1 flex-col bg-wrong/90 text-[11px] hover:bg-wrong",
          )}
        >
          <Trash2 className="size-4" style={{ transform: `scale(${1 + commitHeat * 0.15})` }} />
          <span>{isOverswiped || exiting ? t("松手直接删除", "Release to delete") : t("删除", "Delete")}</span>
        </button>
      </div>

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
          "relative z-10 flex cursor-grab touch-pan-y items-start gap-3 bg-surface px-4 py-3.5 select-none active:cursor-grabbing",
        )}
        style={{
          transform: `translate3d(${x}px, 0, 0)`,
          transition: isSettling ? `transform ${SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
          boxShadow: approaching || isOverswiped ? `inset -8px 0 16px -8px rgb(225 29 72 / ${0.18 + commitHeat * 0.35})` : undefined,
        }}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface-2 text-xs font-bold text-accent">
          {item.avatarText}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-fg">{item.sender}</p>
            <span className="shrink-0 text-[10px] text-fg-subtle">{item.time}</span>
          </div>
          <p className="mt-0.5 truncate text-[12px] font-medium text-fg/90">{item.subject}</p>
          <p className="mt-0.5 truncate text-[11px] text-fg-muted">{item.preview}</p>
        </div>
        {item.unread && <div className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />}
      </div>
    </div>
  );
}
