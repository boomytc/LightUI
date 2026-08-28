import { useState } from "react";
import { Bookmark, Heart, UserPlus, Trash2, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { ACTION_FORMULAS, type ActionKind } from "./lib/kinds";
import {
  createOptimisticRecord,
  applyOptimisticTrigger,
  commitOptimisticSuccess,
  rollbackOptimisticFailure,
  settleToIdle,
  type OptimisticRecord,
} from "./lib/machines";
import { pick, useLocale } from "./lib/site-locale";
import { cn, sleep } from "./lib/utils";

export function StudyView() {
  const locale = useLocale();

  const [selectedKind, setSelectedKind] = useState<ActionKind>("bookmark");
  const [latencyMs, setLatencyMs] = useState<number>(1000);
  const [shouldFail, setShouldFail] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // States for actions
  const [bookmarkRecord, setBookmarkRecord] = useState<OptimisticRecord<boolean>>(() =>
    createOptimisticRecord(false),
  );
  const [likeRecord, setLikeRecord] = useState<OptimisticRecord<number>>(() =>
    createOptimisticRecord(42),
  );
  const [followRecord, setFollowRecord] = useState<OptimisticRecord<boolean>>(() =>
    createOptimisticRecord(false),
  );
  const [deleteRecord, setDeleteRecord] = useState<OptimisticRecord<boolean>>(() =>
    createOptimisticRecord(false),
  );

  const activeRecord =
    selectedKind === "bookmark"
      ? bookmarkRecord
      : selectedKind === "like"
        ? likeRecord
        : selectedKind === "follow"
          ? followRecord
          : deleteRecord;

  // Trigger handlers
  async function triggerBookmark() {
    const nextVal = !bookmarkRecord.current;
    const nextRec = applyOptimisticTrigger(bookmarkRecord, nextVal, "bookmark");
    setBookmarkRecord(nextRec);
    const token = nextRec.token;

    setToastMsg(
      locale === "en"
        ? (nextVal ? "Bookmarked (syncing...)" : "Removed (syncing...)")
        : (nextVal ? "已收藏，后台同步中" : "已取消，后台同步中"),
    );

    try {
      await sleep(latencyMs);
      if (shouldFail) throw new Error("Sync timeout");
      setBookmarkRecord((prev) => commitOptimisticSuccess(prev, token));
      setToastMsg(locale === "en" ? "Synced" : "同步完成");
      await sleep(800);
      setBookmarkRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    } catch {
      setBookmarkRecord((prev) => rollbackOptimisticFailure(prev, token));
      setToastMsg(
        locale === "en"
          ? "Sync failed: reverted to snapshot"
          : "网络同步失败，已依据快照原位还原",
      );
      await sleep(1800);
      setBookmarkRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    }
  }

  async function triggerLike() {
    const isLiked = likeRecord.current > 42;
    const nextVal = isLiked ? 42 : 43;
    const nextRec = applyOptimisticTrigger(likeRecord, nextVal, "like");
    setLikeRecord(nextRec);
    const token = nextRec.token;

    setToastMsg(locale === "en" ? "Liked" : "点赞响应完成");

    try {
      await sleep(latencyMs);
      if (shouldFail) throw new Error("Network error");
      setLikeRecord((prev) => commitOptimisticSuccess(prev, token));
      await sleep(600);
      setLikeRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    } catch {
      setLikeRecord((prev) => rollbackOptimisticFailure(prev, token));
      setToastMsg(locale === "en" ? "Like failed: count reverted" : "点赞失败，计数已恢复");
      await sleep(1800);
      setLikeRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    }
  }

  async function triggerFollow() {
    const nextVal = !followRecord.current;
    const nextRec = applyOptimisticTrigger(followRecord, nextVal, "follow");
    setFollowRecord(nextRec);
    const token = nextRec.token;

    setToastMsg(
      locale === "en"
        ? (nextVal ? "Followed (syncing)" : "Unfollowed (syncing)")
        : (nextVal ? "已关注" : "已取消关注"),
    );

    try {
      await sleep(latencyMs);
      if (shouldFail) throw new Error("Connection lost");
      setFollowRecord((prev) => commitOptimisticSuccess(prev, token));
      await sleep(600);
      setFollowRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    } catch {
      setFollowRecord((prev) => rollbackOptimisticFailure(prev, token));
      setToastMsg(locale === "en" ? "Follow failed: rolled back" : "关注失败，已恢复原状态");
      await sleep(1800);
      setFollowRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    }
  }

  async function triggerDelete() {
    // Non-optimistic: stays false until confirmed
    const nextRec = applyOptimisticTrigger(deleteRecord, true, "delete");
    setDeleteRecord(nextRec);
    const token = nextRec.token;

    setToastMsg(locale === "en" ? "Awaiting server deletion..." : "高风险操作：等待服务端确认中...");

    try {
      await sleep(latencyMs);
      if (shouldFail) throw new Error("Permission denied");
      setDeleteRecord((prev) => commitOptimisticSuccess(prev, token, true));
      setToastMsg(locale === "en" ? "Item deleted" : "删除成功");
    } catch {
      setDeleteRecord((prev) => rollbackOptimisticFailure(prev, token));
      setToastMsg(locale === "en" ? "Delete aborted" : "删除中断，未做改动");
      await sleep(1800);
      setDeleteRecord((prev) => settleToIdle(prev, token));
      setToastMsg(null);
    }
  }

  function resetAll() {
    setBookmarkRecord(createOptimisticRecord(false));
    setLikeRecord(createOptimisticRecord(42));
    setFollowRecord(createOptimisticRecord(false));
    setDeleteRecord(createOptimisticRecord(false));
    setToastMsg(null);
  }

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does the action wait for network ACK or commit optimistically?"
              : "点完这一击，界面是等网络回执还是立即改？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Optimistic update assumes success and responds instantly. When the network drops or rejects, it restores the exact snapshot with clear semantics. Irreversible high-risk actions must never be optimistic."
              : "成功是默认路径，UI 先行即时响应；若网络失败，根据快照原位回滚并说明原因；不可逆高风险操作严禁乐观更新。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Toggle error simulation below to watch the snapshot rollback in action. Try multi-clicking to observe token ordering."
            : "开启下方「模拟网络失败」观察快照原位回滚；尝试连续点击观察 Token 防竞态机制。"}
        </p>
      </section>

      {/* Interactive Playground */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted/40 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-fg-muted">
              {locale === "en" ? "Action Target:" : "操作对象:"}
            </span>
            {(["bookmark", "like", "follow", "delete"] as ActionKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKind(k)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  selectedKind === k
                    ? "bg-fg text-surface"
                    : "bg-surface text-fg-muted hover:text-fg border border-border",
                )}
              >
                {k === "bookmark"
                  ? (locale === "en" ? "Bookmark" : "收藏")
                  : k === "like"
                    ? (locale === "en" ? "Like" : "点赞")
                    : k === "follow"
                      ? (locale === "en" ? "Follow" : "关注")
                      : (locale === "en" ? "Delete (Pessimistic)" : "彻底删除 (悲观)")}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px]">
            <label className="flex items-center gap-1.5 text-fg-muted cursor-pointer">
              <input
                type="checkbox"
                checked={shouldFail}
                onChange={(e) => setShouldFail(e.target.checked)}
                className="size-4 rounded border-border text-accent accent-accent"
              />
              <span className={cn(shouldFail && "font-semibold text-accent")}>
                {locale === "en" ? "Simulate Failure" : "模拟接口失败 (看回滚)"}
              </span>
            </label>

            <div className="flex items-center gap-1.5 text-fg-muted">
              <span>{locale === "en" ? "Latency:" : "网络延迟:"}</span>
              <select
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="rounded border border-border bg-surface px-2 py-0.5 text-[11px]"
              >
                <option value={200}>200ms ({locale === "en" ? "Fast" : "快速"})</option>
                <option value={1000}>1000ms ({locale === "en" ? "Normal" : "正常"})</option>
                <option value={2500}>2500ms ({locale === "en" ? "Slow 3G" : "弱网"})</option>
              </select>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-fg-muted hover:text-fg"
            >
              <RotateCcw className="size-3.5" />
              {locale === "en" ? "Reset" : "重置"}
            </button>
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Card Presentation */}
          <div className="relative flex flex-col justify-between rounded-xl border border-border bg-surface p-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                    {selectedKind === "delete"
                      ? (locale === "en" ? "High Risk Data" : "高风险资源")
                      : (locale === "en" ? "Design Insight" : "设计灵感")}
                  </span>
                  <h3 className="mt-2 text-[18px] font-semibold text-fg">
                    {selectedKind === "delete"
                      ? (locale === "en" ? "Core Project Database" : "核心项目数据库")
                      : (locale === "en" ? "Designing for Optimistic Perception" : "让等待变得可感知：乐观更新")}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                    {selectedKind === "delete"
                      ? (locale === "en"
                        ? "Irreversible destructive operation. Requires explicit server commit before updating view."
                        : "不可逆危险操作。严禁乐观更新，必须等待服务端确定成功后方可更新视图。")
                      : (locale === "en"
                        ? "Immediate UI reaction with background asynchronous synchronization and snapshot recovery."
                        : "点击立即翻转状态，网络在后台静默同步。若网络发生故障，依据快照平滑原位回滚。")}
                  </p>
                </div>
              </div>

              {/* Action area */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                {selectedKind === "bookmark" && (
                  <button
                    type="button"
                    onClick={triggerBookmark}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-all active:scale-95",
                      bookmarkRecord.current
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-fg hover:border-fg/30",
                    )}
                  >
                    <Bookmark
                      className={cn(
                        "size-4 transition-transform",
                        bookmarkRecord.current ? "fill-current scale-110" : "scale-100",
                      )}
                    />
                    {bookmarkRecord.current
                      ? (locale === "en" ? "Saved" : "已收藏")
                      : (locale === "en" ? "Save" : "收藏")}
                  </button>
                )}

                {selectedKind === "like" && (
                  <button
                    type="button"
                    onClick={triggerLike}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-all active:scale-95",
                      likeRecord.current > 42
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "border-border bg-surface text-fg hover:border-fg/30",
                    )}
                  >
                    <Heart
                      className={cn(
                        "size-4 transition-transform",
                        likeRecord.current > 42 ? "fill-current scale-110" : "scale-100",
                      )}
                    />
                    <span>{likeRecord.current}</span>
                  </button>
                )}

                {selectedKind === "follow" && (
                  <button
                    type="button"
                    onClick={triggerFollow}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-all active:scale-95",
                      followRecord.current
                        ? "border-border bg-surface-muted text-fg-muted"
                        : "border-fg bg-fg text-surface hover:opacity-90",
                    )}
                  >
                    <UserPlus className="size-4" />
                    {followRecord.current
                      ? (locale === "en" ? "Following" : "已关注")
                      : (locale === "en" ? "Follow" : "关注")}
                  </button>
                )}

                {selectedKind === "delete" && (
                  <button
                    type="button"
                    disabled={deleteRecord.phase === "syncing" || deleteRecord.current}
                    onClick={triggerDelete}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-50",
                    )}
                  >
                    {deleteRecord.phase === "syncing" ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    {deleteRecord.current
                      ? (locale === "en" ? "Deleted" : "已彻底删除")
                      : deleteRecord.phase === "syncing"
                        ? (locale === "en" ? "Deleting on Server..." : "服务端删除中...")
                        : (locale === "en" ? "Delete Permanently" : "删除数据库")}
                  </button>
                )}

                {/* Status indicator pill */}
                <div className="flex items-center gap-2 text-[12px]">
                  {activeRecord.phase === "syncing" && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <RefreshCw className="size-3.5 animate-spin" />
                      {locale === "en" ? "Syncing..." : "后台同步中"}
                    </span>
                  )}
                  {activeRecord.phase === "synced" && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      {locale === "en" ? "Synced" : "已确认"}
                    </span>
                  )}
                  {activeRecord.phase === "error" && (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="size-3.5" />
                      {locale === "en" ? "Rolled Back" : "已原位回滚"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Floating toast inside frame */}
            {toastMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-fg px-3.5 py-2 text-[12px] font-medium text-surface shadow-float">
                {activeRecord.phase === "error" ? (
                  <AlertTriangle className="size-4 text-amber-300" />
                ) : activeRecord.phase === "synced" ? (
                  <CheckCircle2 className="size-4 text-emerald-300" />
                ) : (
                  <RefreshCw className="size-4 animate-spin" />
                )}
                <span>{toastMsg}</span>
              </div>
            )}
          </div>

          {/* State & Machine Inspector */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-muted/40 p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                {locale === "en" ? "State Telemetry & Snapshot" : "状态机与快照侦测"}
              </p>

              <div className="mt-4 space-y-3 font-mono text-[12px]">
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">phase</span>
                  <span
                    className={cn(
                      "font-semibold px-2 py-0.5 rounded text-[11px]",
                      activeRecord.phase === "syncing"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : activeRecord.phase === "error"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : activeRecord.phase === "synced"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-surface-muted text-fg-muted",
                    )}
                  >
                    "{activeRecord.phase}"
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">current_value</span>
                  <span className="font-semibold text-fg">
                    {String(activeRecord.current)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">snapshot_value</span>
                  <span className="font-semibold text-fg-subtle">
                    {String(activeRecord.snapshot)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">token_seq</span>
                  <span className="font-semibold text-fg">{activeRecord.token}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">allow_optimistic</span>
                  <span
                    className={cn(
                      "font-semibold",
                      selectedKind !== "delete" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600",
                    )}
                  >
                    {String(selectedKind !== "delete")}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-fg-muted">
              {locale === "en"
                ? "If network sync fails, the state machine restores current_value := snapshot_value. Token ensures asynchronous idempotency."
                : "若网络同步报错，状态机强制执行 current := snapshot 原位恢复。Token 序列确保异步请求乱序时不覆盖最新状态。"}
            </p>
          </div>
        </div>
      </div>

      {/* Formula Cards */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTION_FORMULAS.map((item) => (
          <div key={item.kind} className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4">
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

      {/* Deep Dive & Distinctions */}
      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "Rules and Safety Boundaries" : "判断准则与安全边界"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Snapshot must precede mutation" : "1. 状态改变前必须先存快照"}
              </span>
              <br />
              {locale === "en"
                ? "Capture the exact previous state before flipping UI. Rollback without snapshot leads to state desynchronization."
                : "在修改 UI 之前记录前序状态。若没有快照，失败时无法还原真实状态，产生界面撒谎。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Sequential tokens prevent race conditions" : "2. 自增 Token 保证异步时序"}
              </span>
              <br />
              {locale === "en"
                ? "Rapid multi-clicks increment tokens; responses with outdated tokens are discarded immediately."
                : "快速连击生成单调自增 Token，过期的异步请求回执直接丢弃，避免旧响应覆盖新状态。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Never optimistic on irreversible actions" : "3. 不可逆与高风险操作严禁乐观"}
              </span>
              <br />
              {locale === "en"
                ? "Payments, deletions, and security permission grants must wait for server verification."
                : "涉及资金交易、彻底删除、权限划转等不可逆动作，必须锁定触发器并显式等待服务端回执。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            Optimistic State Machine
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function onTrigger(next) {
  const snapshot = current;
  const token = ++seq;
  setPhase("syncing");
  setCurrent(next); // UI 先行

  api.sync(next)
    .then(() => {
      if (token === seq) setPhase("synced");
    })
    .catch((err) => {
      if (token === seq) {
        setCurrent(snapshot); // 快照回滚
        setPhase("error");
      }
    });
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Revert to snapshot upon error. Drop stale responses if token is superseded."
              : "失败时根据快照原位还原；Token 保证多连击时只认最新的结果。"}
          </p>
        </article>
      </section>
    </div>
  );
}
