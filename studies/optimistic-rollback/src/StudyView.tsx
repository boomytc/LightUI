import { useState } from "react";
import { PATHS, type PathId } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";
import { Playground } from "./optimistic/Playground";

export function StudyView() {
  const locale = useLocale();
  const [path, setPath] = useState<PathId>("lead");

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does the action wait for network ACK or commit optimistically?"
              : "点完这一击，界面是等网络回执还是立即改？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Success is the default path: the UI leads. On failure, roll back in place from the snapshot and say why. Irreversible high-risk work must never be optimistic."
              : "成功是默认路径，UI 先行；失败按快照原位回滚并说明；不可逆高风险禁止乐观更新。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Pick a path first — lead, rollback, or forbid — then click the control. Rapid clicks only keep the latest token."
            : "先选路径：先行、回滚，或禁止乐观。再点控件。连击只认最新 Token。"}
        </p>
      </section>

      <Playground path={path} onPathChange={setPath} />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {PATHS.map((item) => {
          const on = item.id === path;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPath(item.id)}
              className={cn(
                "flex gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                on ? "border-border-strong bg-surface shadow-card" : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
                {item.id === "lead" ? "1" : item.id === "rollback" ? "2" : "3"}
              </span>
              <div className="min-w-0">
                <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
                <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.desc, locale)}</p>
              </div>
            </button>
          );
        })}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell the paths apart" : "怎么把三条路径分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Snapshot must precede mutation" : "1. 状态改变前必须先存快照"}
              </span>
              <br />
              {locale === "en"
                ? "Capture the exact previous state before flipping the UI. Rollback without a snapshot is just another lie."
                : "在修改 UI 之前记录前序状态。没有快照，失败时无法还原，界面继续撒谎。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Sequential tokens drop stale receipts" : "2. 自增 Token 丢掉过期回执"}
              </span>
              <br />
              {locale === "en"
                ? "Rapid clicks increment the token. A late ACK with an old token must not overwrite the latest state."
                : "快速连击生成单调自增 Token。过期回执直接丢弃，避免旧响应覆盖新状态。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Never optimistic on irreversible work" : "3. 不可逆与高风险操作严禁乐观"}
              </span>
              <br />
              {locale === "en"
                ? "Payments, hard deletes, and permission grants lock the trigger and wait for the server."
                : "资金、彻底删除、权限划转必须锁定触发器，显式等待服务端回执。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
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
    .catch(() => {
      if (token === seq) {
        setCurrent(snapshot); // 快照回滚
        setPhase("error");
      }
    });
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Revert to snapshot on error. Drop stale responses if the token was superseded. High-risk kinds never flip current."
              : "失败时按快照原位还原；Token 只认最新结果。高风险种类不会先改 current。"}
          </p>
        </article>
      </section>
    </div>
  );
}
