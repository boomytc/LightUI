import { AlertTriangle, Bookmark, CheckCircle2, RefreshCw, ShieldOff, Trash2 } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { cn } from "./lib/utils";
import "./optimistic/optimistic.css";

export function StageView() {
  const { kind, state } = readStageQuery();
  const forbid = kind === "delete";
  const path = forbid ? "forbid" : state === "error" ? "rollback" : "lead";
  const saved = !forbid && (state === "synced" || state === "syncing");
  const deleted = forbid && state === "synced";
  const waiting = forbid && state === "syncing";

  return (
    <div data-stage="root" className="flex min-h-[360px] w-full items-center justify-center bg-bg p-8">
      <div
        data-stage="fixture"
        data-path={path}
        className="or-fixture or-stage w-full max-w-sm p-5 shadow-card"
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
            forbid ? "bg-fg text-surface" : "bg-surface/80 text-fg-muted",
          )}
        >
          {forbid ? <ShieldOff className="size-3" /> : null}
          {forbid ? "禁止乐观" : state === "error" ? "回滚" : "先行"}
        </span>
        <h3 className="mt-3 text-[16px] font-semibold tracking-tight text-fg">
          {forbid ? "核心项目数据库" : "让等待变得可感知"}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-fg-muted">
          {forbid
            ? waiting
              ? "触发器已锁定。current 仍等于 snapshot。"
              : deleted
                ? "服务端确认后才提交视图。"
                : "不可逆操作必须等回执。界面从未先行。"
            : state === "error"
              ? "同步失败。已按快照原位还原，并说明原因。"
              : state === "syncing"
                ? "UI 已先行到目标值，网络还在后台同步。"
                : "服务端已确认。快照与当前值对齐。"}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
          {forbid ? (
            <div
              className={cn(
                "or-action inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-white",
                deleted ? "bg-wrong/80" : "bg-wrong",
                waiting && "opacity-70",
              )}
              data-motion={waiting ? "wait" : "none"}
            >
              {waiting ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              {deleted ? "已彻底删除" : waiting ? "服务端删除中…" : "删除数据库"}
            </div>
          ) : (
            <div
              className={cn(
                "or-action inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium",
                saved
                  ? "border-accent bg-accent-soft text-accent"
                  : state === "error"
                    ? "border-border bg-surface text-fg-muted"
                    : "border-border bg-surface text-fg",
              )}
              data-motion={state === "syncing" ? "live" : state === "error" ? "snap" : "none"}
            >
              <Bookmark className={cn("size-3.5", saved && "fill-current")} />
              <span>{saved ? "已收藏" : state === "error" ? "已还原" : "收藏"}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {state === "syncing" ? (
              <span className="flex items-center gap-1 text-predict">
                {forbid ? <RefreshCw className="size-3 animate-spin" /> : null}
                {forbid ? "await ACK" : "syncing"}
              </span>
            ) : null}
            {state === "synced" ? (
              <span className="flex items-center gap-1 text-intent">
                <CheckCircle2 className="size-3" />
                synced
              </span>
            ) : null}
            {state === "error" ? (
              <span className="flex items-center gap-1 font-semibold text-wrong">
                <AlertTriangle className="size-3" />
                {forbid ? "unchanged" : "rolled back"}
              </span>
            ) : null}
          </div>
        </div>

        {!forbid && state === "error" ? (
          <div className="or-compare mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2" data-dir="back">
            <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
              <p className="text-[10px] tracking-[0.12em] text-fg-subtle uppercase">快照</p>
              <p className="mt-0.5 text-[12px] font-semibold">未收藏</p>
            </div>
            <span className="or-compare-arrow text-wrong">←</span>
            <div className="or-compare-cell rounded-lg border border-border bg-surface px-3 py-2 text-center" data-flash="true">
              <p className="text-[10px] tracking-[0.12em] text-fg-subtle uppercase">当前</p>
              <p className="mt-0.5 text-[12px] font-semibold">未收藏</p>
            </div>
          </div>
        ) : null}

        {!forbid && state === "syncing" ? (
          <div className="or-compare mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2" data-dir="forward">
            <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
              <p className="text-[10px] tracking-[0.12em] text-fg-subtle uppercase">快照</p>
              <p className="mt-0.5 text-[12px] font-semibold">未收藏</p>
            </div>
            <span className="or-compare-arrow text-intent">→</span>
            <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
              <p className="text-[10px] tracking-[0.12em] text-fg-subtle uppercase">当前</p>
              <p className="mt-0.5 text-[12px] font-semibold">已收藏</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
