import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Heart,
  RefreshCw,
  RotateCcw,
  ShieldOff,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  ACTION_FORMULAS,
  PATH_STEPS,
  PATHS,
  type ActionKind,
  type PathId,
} from "../lib/kinds";
import {
  applyOptimisticTrigger,
  commitOptimisticSuccess,
  createOptimisticRecord,
  isOptimisticAllowed,
  rollbackOptimisticFailure,
  settleToIdle,
  type OptimisticRecord,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn, sleep } from "../lib/utils";
import "./optimistic.css";

const LIKE_BASE = 42;

type CaptionTone = "sync" | "ok" | "err" | "wait";
type Caption = { tone: CaptionTone; text: string };
type Motion = "none" | "flip" | "live" | "snap" | "wait";

type Props = {
  path: PathId;
  onPathChange: (path: PathId) => void;
};

export function Playground({ path, onPathChange }: Props) {
  const locale = useLocale();
  const [kind, setKind] = useState<ActionKind>("bookmark");
  const [latencyMs, setLatencyMs] = useState(1000);
  const [failDelete, setFailDelete] = useState(false);
  const [caption, setCaption] = useState<Caption | null>(null);
  const [dropped, setDropped] = useState<number | null>(null);
  const [motion, setMotion] = useState<Motion>("none");
  const latestRef = useRef<Record<ActionKind, number>>({
    bookmark: 0,
    like: 0,
    follow: 0,
    delete: 0,
  });
  const motionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [bookmark, setBookmark] = useState<OptimisticRecord<boolean>>(() =>
    createOptimisticRecord(false),
  );
  const [like, setLike] = useState<OptimisticRecord<number>>(() =>
    createOptimisticRecord(LIKE_BASE),
  );
  const [follow, setFollow] = useState<OptimisticRecord<boolean>>(() =>
    createOptimisticRecord(false),
  );
  const [removal, setRemoval] = useState<OptimisticRecord<boolean>>(() =>
    createOptimisticRecord(false),
  );

  const bookmarkRef = useRef(bookmark);
  const likeRef = useRef(like);
  const followRef = useRef(follow);
  const removalRef = useRef(removal);
  bookmarkRef.current = bookmark;
  likeRef.current = like;
  followRef.current = follow;
  removalRef.current = removal;

  const pathMeta = PATHS.find((item) => item.id === path) ?? PATHS[0];
  const willFail = path === "rollback" || (path === "forbid" && failDelete);
  const optimistic = isOptimisticAllowed(kind);

  const record =
    kind === "bookmark" ? bookmark : kind === "like" ? like : kind === "follow" ? follow : removal;

  function seedRecords() {
    const nextBookmark = createOptimisticRecord(false);
    const nextLike = createOptimisticRecord(LIKE_BASE);
    const nextFollow = createOptimisticRecord(false);
    const nextRemoval = createOptimisticRecord(false);
    bookmarkRef.current = nextBookmark;
    likeRef.current = nextLike;
    followRef.current = nextFollow;
    removalRef.current = nextRemoval;
    setBookmark(nextBookmark);
    setLike(nextLike);
    setFollow(nextFollow);
    setRemoval(nextRemoval);
    setCaption(null);
    setDropped(null);
    setMotion("none");
    latestRef.current = { bookmark: 0, like: 0, follow: 0, delete: 0 };
  }

  useEffect(() => {
    seedRecords();
    setKind(path === "forbid" ? "delete" : "bookmark");
    setFailDelete(false);
  }, [path]);

  function resetAll() {
    seedRecords();
  }

  function noteLatest(target: ActionKind, token: number) {
    latestRef.current[target] = token;
  }

  function isCurrent(target: ActionKind, token: number) {
    return latestRef.current[target] === token;
  }

  function pulseThenLive() {
    if (motionTimer.current !== undefined) clearTimeout(motionTimer.current);
    setMotion("flip");
    motionTimer.current = setTimeout(() => {
      setMotion((current) => (current === "flip" ? "live" : current));
    }, 420);
  }

  function writeBookmark(next: OptimisticRecord<boolean>) {
    bookmarkRef.current = next;
    setBookmark(next);
  }

  function writeLike(next: OptimisticRecord<number>) {
    likeRef.current = next;
    setLike(next);
  }

  function writeFollow(next: OptimisticRecord<boolean>) {
    followRef.current = next;
    setFollow(next);
  }

  function writeRemoval(next: OptimisticRecord<boolean>) {
    removalRef.current = next;
    setRemoval(next);
  }

  async function finish(target: ActionKind, token: number, fail: boolean, wait: number) {
    try {
      await sleep(wait);
      if (fail) throw new Error("sync failed");
      if (!isCurrent(target, token)) {
        setDropped(token);
        return;
      }

      if (target === "delete") writeRemoval(commitOptimisticSuccess(removalRef.current, token, true));
      else if (target === "bookmark") writeBookmark(commitOptimisticSuccess(bookmarkRef.current, token));
      else if (target === "like") writeLike(commitOptimisticSuccess(likeRef.current, token));
      else writeFollow(commitOptimisticSuccess(followRef.current, token));

      setMotion("none");
      setCaption({
        tone: "ok",
        text:
          target === "delete"
            ? locale === "en"
              ? "Server deleted the record"
              : "服务端已删除"
            : locale === "en"
              ? "Server confirmed"
              : "服务端已确认",
      });

      if (target === "delete") return;

      await sleep(720);
      if (!isCurrent(target, token)) return;
      if (target === "bookmark") writeBookmark(settleToIdle(bookmarkRef.current, token));
      else if (target === "like") writeLike(settleToIdle(likeRef.current, token));
      else writeFollow(settleToIdle(followRef.current, token));
      setCaption(null);
    } catch {
      if (!isCurrent(target, token)) {
        setDropped(token);
        return;
      }

      if (target === "delete") writeRemoval(rollbackOptimisticFailure(removalRef.current, token));
      else if (target === "bookmark") writeBookmark(rollbackOptimisticFailure(bookmarkRef.current, token));
      else if (target === "like") writeLike(rollbackOptimisticFailure(likeRef.current, token));
      else writeFollow(rollbackOptimisticFailure(followRef.current, token));

      setMotion(target === "delete" ? "none" : "snap");
      setCaption({
        tone: "err",
        text:
          target === "delete"
            ? locale === "en"
              ? "Delete aborted. The view never changed."
              : "删除中断，界面从未改动"
            : locale === "en"
              ? "Sync failed. Restored from snapshot."
              : "同步失败，已按快照原位还原",
      });

      await sleep(1700);
      if (!isCurrent(target, token)) return;
      if (target === "delete") writeRemoval(settleToIdle(removalRef.current, token));
      else if (target === "bookmark") writeBookmark(settleToIdle(bookmarkRef.current, token));
      else if (target === "like") writeLike(settleToIdle(likeRef.current, token));
      else writeFollow(settleToIdle(followRef.current, token));
      setCaption(null);
      setMotion("none");
    }
  }

  function triggerBookmark() {
    const prev = bookmarkRef.current;
    const nextVal = !prev.current;
    const next = applyOptimisticTrigger(prev, nextVal, "bookmark");
    writeBookmark(next);
    noteLatest("bookmark", next.token);
    setDropped(null);
    pulseThenLive();
    setCaption({
      tone: "sync",
      text:
        locale === "en"
          ? nextVal
            ? "Saved · syncing in background"
            : "Removed · syncing in background"
          : nextVal
            ? "已收藏 · 后台同步中"
            : "已取消 · 后台同步中",
    });
    void finish("bookmark", next.token, willFail, latencyMs);
  }

  function triggerLike() {
    const prev = likeRef.current;
    const nextVal = prev.current > LIKE_BASE ? LIKE_BASE : LIKE_BASE + 1;
    const next = applyOptimisticTrigger(prev, nextVal, "like");
    writeLike(next);
    noteLatest("like", next.token);
    setDropped(null);
    pulseThenLive();
    setCaption({
      tone: "sync",
      text: locale === "en" ? "Liked · syncing in background" : "点赞已响应 · 后台同步中",
    });
    void finish("like", next.token, willFail, latencyMs);
  }

  function triggerFollow() {
    const prev = followRef.current;
    const nextVal = !prev.current;
    const next = applyOptimisticTrigger(prev, nextVal, "follow");
    writeFollow(next);
    noteLatest("follow", next.token);
    setDropped(null);
    pulseThenLive();
    setCaption({
      tone: "sync",
      text:
        locale === "en"
          ? nextVal
            ? "Following · syncing"
            : "Unfollowed · syncing"
          : nextVal
            ? "已关注 · 后台同步中"
            : "已取消关注 · 后台同步中",
    });
    void finish("follow", next.token, willFail, latencyMs);
  }

  function triggerDelete() {
    const prev = removalRef.current;
    if (prev.phase === "syncing" || prev.current) return;
    const next = applyOptimisticTrigger(prev, true, "delete");
    writeRemoval(next);
    noteLatest("delete", next.token);
    setDropped(null);
    setMotion("wait");
    setCaption({
      tone: "wait",
      text:
        locale === "en"
          ? "High risk · waiting for server. View unchanged."
          : "高风险 · 等待服务端确认，界面未改",
    });
    void finish("delete", next.token, willFail, latencyMs);
  }

  const formula = ACTION_FORMULAS.find((item) => item.kind === kind);

  return (
    <div id="or-play" data-path={path} className="or-play">
      <div className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
        {PATHS.map((item) => {
          const on = item.id === path;
          return (
            <button
              key={item.id}
              type="button"
              data-on={on}
              aria-pressed={on}
              onClick={() => onPathChange(item.id)}
              className={cn(
                "or-path-btn min-h-16 px-4 py-3 text-left transition-colors",
                on ? "text-fg" : "bg-surface-2/70 text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mb-1.5 block size-1.5 rounded-full",
                  item.id === "lead" && "bg-intent",
                  item.id === "rollback" && "bg-wrong",
                  item.id === "forbid" && "bg-fg",
                )}
              />
              <p className="text-[11px] font-medium tracking-[0.14em] text-fg-subtle uppercase">
                {pick(item.eyebrow, locale)}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-tight">{pick(item.title, locale)}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{pick(item.desc, locale)}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          {path !== "forbid" ? (
            <>
              <span className="text-[12px] text-fg-muted">{locale === "en" ? "Skin" : "对象"}</span>
              {pathMeta.kinds.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setKind(item)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                    kind === item
                      ? "bg-fg text-surface"
                      : "border border-border bg-surface text-fg-muted hover:text-fg",
                  )}
                >
                  {item === "bookmark"
                    ? locale === "en"
                      ? "Bookmark"
                      : "收藏"
                    : item === "like"
                      ? locale === "en"
                        ? "Like"
                        : "点赞"
                      : locale === "en"
                        ? "Follow"
                        : "关注"}
                </button>
              ))}
            </>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-fg-muted">
              <input
                type="checkbox"
                checked={failDelete}
                onChange={(event) => setFailDelete(event.target.checked)}
                className="size-4 accent-wrong"
              />
              <span className={cn(failDelete && "font-medium text-wrong")}>
                {locale === "en" ? "Server rejects the delete" : "服务端拒绝删除"}
              </span>
            </label>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[12px] text-fg-muted">
          <label className="flex items-center gap-1.5">
            <span>{locale === "en" ? "Latency" : "延迟"}</span>
            <select
              value={latencyMs}
              onChange={(event) => setLatencyMs(Number(event.target.value))}
              className="rounded-md border border-border bg-surface px-2 py-1 text-[12px] text-fg"
            >
              <option value={200}>200ms</option>
              <option value={1000}>1000ms</option>
              <option value={2500}>2500ms</option>
            </select>
          </label>
          <button type="button" onClick={resetAll} className="inline-flex items-center gap-1 hover:text-fg">
            <RotateCcw className="size-3.5" />
            {locale === "en" ? "Reset" : "重置"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
        <ProductCard
          locale={locale}
          path={path}
          kind={kind}
          record={record}
          motion={resolveMotion(motion, record.phase, optimistic)}
          caption={caption}
          onTrigger={
            kind === "bookmark"
              ? triggerBookmark
              : kind === "like"
                ? triggerLike
                : kind === "follow"
                  ? triggerFollow
                  : triggerDelete
          }
        />

        <Ledger
          locale={locale}
          path={path}
          kind={kind}
          record={record}
          optimistic={optimistic}
          dropped={dropped}
          hint={formula ? pick(formula.desc, locale) : ""}
        />
      </div>
    </div>
  );
}

function resolveMotion(motion: Motion, phase: OptimisticRecord<unknown>["phase"], optimistic: boolean): Motion {
  if (phase === "error") return "snap";
  if (phase === "syncing" && !optimistic) return "wait";
  if (phase === "syncing" && (motion === "none" || motion === "flip")) return motion === "flip" ? "flip" : "live";
  if (phase !== "syncing" && motion === "live") return "none";
  return motion;
}

function ProductCard({
  locale,
  path,
  kind,
  record,
  motion,
  caption,
  onTrigger,
}: {
  locale: Locale;
  path: PathId;
  kind: ActionKind;
  record: OptimisticRecord<boolean | number>;
  motion: Motion;
  caption: Caption | null;
  onTrigger: () => void;
}) {
  const forbid = path === "forbid";

  return (
    <div className="or-stage flex min-h-[22rem] flex-col justify-between p-5 sm:p-6">
      <div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
            forbid ? "bg-fg text-surface" : "bg-surface/80 text-fg-muted",
          )}
        >
          {forbid ? <ShieldOff className="size-3" /> : null}
          {forbid
            ? locale === "en"
              ? "Irreversible resource"
              : "不可逆资源"
            : locale === "en"
              ? "Reversible signal"
              : "可逆信号"}
        </span>
        <h3 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-fg">
          {forbid
            ? locale === "en"
              ? "Core project database"
              : "核心项目数据库"
            : locale === "en"
              ? "Notes on optimistic perception"
              : "让等待变得可感知"}
        </h3>
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-fg-muted">
          {forbid
            ? locale === "en"
              ? "The view stays put until the server commits. A spinner here is honest wait, not a fake success."
              : "界面先不动。这里的转圈是诚实等待，不是假装已经删掉。"
            : path === "rollback"
              ? locale === "en"
                ? "Click once: the control flips first. This path is wired to fail, so the snapshot pulls it back."
                : "点一下：控件先翻过去。这条路径固定失败，快照会把它拉回来。"
              : locale === "en"
                ? "Click once: the control flips first. Sync stays in the background — no spinner on the button."
                : "点一下：控件先翻过去。同步留在后台，按钮上不转圈。"}
        </p>
      </div>

      <div className="mt-6 border-t border-border/80 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {kind === "bookmark" ? (
            <button
              type="button"
              onClick={onTrigger}
              data-motion={motion}
              className={cn(
                "or-action inline-flex items-center gap-2 rounded-full border px-4 text-[13px] font-medium",
                record.current
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface text-fg hover:border-border-strong",
              )}
            >
              <Bookmark className={cn("size-4 transition-transform duration-200", record.current ? "scale-110 fill-current" : undefined)} />
              {record.current ? (locale === "en" ? "Saved" : "已收藏") : locale === "en" ? "Save" : "收藏"}
            </button>
          ) : null}

          {kind === "like" ? (
            <button
              type="button"
              onClick={onTrigger}
              data-motion={motion}
              className={cn(
                "or-action inline-flex items-center gap-2 rounded-full border px-4 text-[13px] font-medium",
                Number(record.current) > LIKE_BASE
                  ? "border-wrong bg-wrong-soft text-wrong"
                  : "border-border bg-surface text-fg hover:border-border-strong",
              )}
            >
              <Heart
                className={cn(
                  "size-4 transition-transform duration-200",
                  Number(record.current) > LIKE_BASE && "scale-110 fill-current",
                )}
              />
              <span>{String(record.current)}</span>
            </button>
          ) : null}

          {kind === "follow" ? (
            <button
              type="button"
              onClick={onTrigger}
              data-motion={motion}
              className={cn(
                "or-action inline-flex items-center gap-2 rounded-full border px-4 text-[13px] font-medium",
                record.current
                  ? "border-border bg-surface-2 text-fg-muted"
                  : "border-fg bg-fg text-surface hover:opacity-90",
              )}
            >
              <UserPlus className="size-4" />
              {record.current ? (locale === "en" ? "Following" : "已关注") : locale === "en" ? "Follow" : "关注"}
            </button>
          ) : null}

          {kind === "delete" ? (
            <button
              type="button"
              disabled={record.phase === "syncing" || Boolean(record.current)}
              onClick={onTrigger}
              data-motion={motion}
              className="or-action inline-flex items-center gap-2 rounded-full bg-wrong px-4 text-[13px] font-medium text-white disabled:opacity-55"
            >
              {record.phase === "syncing" ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {record.current
                ? locale === "en"
                  ? "Deleted"
                  : "已彻底删除"
                : record.phase === "syncing"
                  ? locale === "en"
                    ? "Deleting on server…"
                    : "服务端删除中…"
                  : locale === "en"
                    ? "Delete permanently"
                    : "删除数据库"}
            </button>
          ) : null}
        </div>

        <div className="mt-3 min-h-11" aria-live="polite">
          {caption ? (
            <p
              className={cn(
                "or-caption inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium",
                caption.tone === "err"
                  ? "bg-wrong-soft text-wrong"
                  : caption.tone === "ok"
                    ? "bg-intent-soft text-intent"
                    : caption.tone === "wait"
                      ? "bg-fg text-surface"
                      : "bg-predict-soft text-predict",
              )}
            >
              {caption.tone === "err" ? (
                <AlertTriangle className="size-3.5 shrink-0" />
              ) : caption.tone === "ok" ? (
                <CheckCircle2 className="size-3.5 shrink-0" />
              ) : caption.tone === "wait" ? (
                <RefreshCw className="size-3.5 shrink-0 animate-spin" />
              ) : null}
              <span>{caption.text}</span>
            </p>
          ) : (
            <p className="px-1 text-[12px] text-fg-subtle">
              {path === "forbid"
                ? locale === "en"
                  ? "No optimistic flip. The label changes only after ACK."
                  : "没有乐观翻转。文案只在回执后改。"
                : locale === "en"
                  ? "The button is the receipt. Failure explains itself here, in place."
                  : "按钮就是回执。失败也在这里原位说明。"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Ledger({
  locale,
  path,
  kind,
  record,
  optimistic,
  dropped,
  hint,
}: {
  locale: Locale;
  path: PathId;
  kind: ActionKind;
  record: OptimisticRecord<boolean | number>;
  optimistic: boolean;
  dropped: number | null;
  hint: string;
}) {
  const steps = PATH_STEPS[path];
  const progress = record.phase === "idle" ? 0 : record.phase === "syncing" ? 0.5 : 1;
  const now =
    record.phase === "idle" ? null : record.phase === "syncing" ? "syncing" : "end";
  const compareDir =
    record.phase === "error" ? "back" : record.phase === "syncing" && optimistic ? "forward" : "hold";

  return (
    <div className="flex min-h-[22rem] flex-col justify-between rounded-xl border border-border bg-surface-2/50 p-4 sm:p-5">
      <div>
        <p className="text-[11px] font-medium tracking-[0.14em] text-fg-subtle uppercase">
          {locale === "en" ? "Snapshot ledger" : "快照台账"}
        </p>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
          <span
            aria-hidden
            className="or-step-bar pointer-events-none absolute top-[0.55rem] right-6 left-6 h-px bg-border"
            style={{ transform: "none" }}
          />
          <span
            aria-hidden
            className="or-step-bar pointer-events-none absolute top-[0.55rem] right-6 left-6 h-px"
            style={{ ["--or-progress" as string]: String(progress) }}
          />
          {steps.map((step) => {
            const active = now === step.id || (step.id === "trigger" && record.phase !== "idle");
            const current = now === step.id || (step.id === "end" && (record.phase === "synced" || record.phase === "error"));
            return (
              <div
                key={step.id}
                data-now={current}
                className={cn("or-step relative pt-4", current ? "text-fg" : active ? "text-fg-muted" : "text-fg-subtle")}
              >
                <span
                  className={cn(
                    "absolute top-0 left-1/2 size-2.5 -translate-x-1/2 rounded-full border",
                    current
                      ? "border-transparent bg-[var(--or-tint)]"
                      : active
                        ? "border-[var(--or-tint)] bg-surface"
                        : "border-border bg-surface",
                  )}
                />
                {locale === "en" ? step.en : step.zh}
              </div>
            );
          })}
        </div>

        <div
          className="or-compare mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
          data-dir={compareDir === "back" ? "back" : compareDir === "forward" ? "forward" : "hold"}
        >
          <CompareCell
            label={locale === "en" ? "snapshot" : "快照"}
            value={displayValue(kind, record.snapshot, locale)}
            flash={false}
          />
          <span
            className={cn(
              "or-compare-arrow text-[13px] text-fg-subtle",
              compareDir === "back" && "text-wrong",
              compareDir === "forward" && "text-intent",
            )}
          >
            {compareDir === "back" ? "←" : compareDir === "forward" ? "→" : "·"}
          </span>
          <CompareCell
            label={locale === "en" ? "current" : "当前"}
            value={displayValue(kind, record.current, locale)}
            flash={record.phase === "error"}
          />
        </div>

        <dl className="mt-4 space-y-2 font-mono text-[12px]">
          <Row label="phase" value={`"${record.phase}"`} tone={record.phase} />
          <Row
            label="token"
            value={
              <span key={record.token} className="or-token">
                #{record.token}
              </span>
            }
          />
          <Row
            label="optimistic"
            value={String(optimistic)}
            tone={optimistic ? "synced" : "error"}
          />
        </dl>

        {dropped !== null ? (
          <p className="or-caption mt-3 text-[12px] text-fg-muted">
            {locale === "en" ? `Dropped stale receipt #${dropped}` : `已丢弃过期回执 #${dropped}`}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-fg-muted">{hint || liveHint(path, record.phase, locale)}</p>
    </div>
  );
}

function CompareCell({
  label,
  value,
  flash,
}: {
  label: string;
  value: string;
  flash: boolean;
}) {
  return (
    <div
      data-flash={flash}
      className="or-compare-cell rounded-lg border border-border bg-surface px-3 py-2 text-center"
    >
      <p className="text-[10px] tracking-[0.12em] text-fg-subtle uppercase">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-fg">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: OptimisticRecord<unknown>["phase"] | "synced" | "error";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
      <dt className="text-fg-muted">{label}</dt>
      <dd
        className={cn(
          "font-semibold",
          tone === "syncing"
            ? "text-predict"
            : tone === "error"
              ? "text-wrong"
              : tone === "synced"
                ? "text-intent"
                : "text-fg",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function displayValue(kind: ActionKind, value: boolean | number, locale: Locale): string {
  if (kind === "like") return String(value);
  if (kind === "bookmark") {
    return value
      ? locale === "en"
        ? "Saved"
        : "已收藏"
      : locale === "en"
        ? "Unsaved"
        : "未收藏";
  }
  if (kind === "follow") {
    return value
      ? locale === "en"
        ? "Following"
        : "已关注"
      : locale === "en"
        ? "Not following"
        : "未关注";
  }
  return value
    ? locale === "en"
      ? "Deleted"
      : "已删除"
    : locale === "en"
      ? "Intact"
      : "仍在";
}

function liveHint(path: PathId, phase: OptimisticRecord<unknown>["phase"], locale: Locale): string {
  if (path === "forbid") {
    if (phase === "syncing") {
      return locale === "en"
        ? "Locked. current still equals snapshot."
        : "已锁定。当前值仍等于快照，还没有先行。";
    }
    if (phase === "error") {
      return locale === "en"
        ? "ACK failed. Nothing to roll back — the view never left."
        : "回执失败。没有可回滚的谎言，因为界面从未离开。";
    }
    return locale === "en"
      ? "High-risk work waits. The machine forbids an optimistic flip."
      : "高风险必须等。状态机禁止乐观翻转。";
  }
  if (phase === "syncing") {
    return locale === "en"
      ? "current already moved. snapshot keeps the way back."
      : "当前值已经走了。快照留着回来的路。";
  }
  if (phase === "error") {
    return locale === "en"
      ? "Token still valid, so current := snapshot."
      : "Token 仍有效，所以执行 current := snapshot。";
  }
  return locale === "en"
    ? "Rapid clicks raise the token. Only the latest receipt may write."
    : "连击会抬高 Token。只有最新回执能写回。";
}
