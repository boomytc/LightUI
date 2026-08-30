import { useEffect, useRef, useState } from "react";
import { MacWindow } from "../mac-window";

const UNDO_MS = 5000;

export function UndoDemo() {
  const [seed, setSeed] = useState(0);
  return <UndoInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function UndoInner({ onReset }: { onReset: () => void }) {
  const [phase, setPhase] = useState<"idle" | "undoable" | "sent">("idle");
  const [left, setLeft] = useState(UNDO_MS);
  const endAt = useRef(0);

  useEffect(() => {
    if (phase !== "undoable") return;
    endAt.current = performance.now() + UNDO_MS;
    let raf = 0;

    const tick = (now: number) => {
      const remain = Math.max(0, endAt.current - now);
      setLeft(remain);
      if (remain <= 0) {
        setPhase("sent");
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const seconds = Math.max(1, Math.ceil(left / 1000));

  return (
    <MacWindow
      title="邮件客户端 · 方案外发"
      eyebrow="Mail / Compose"
      badge={
        <button
          type="button"
          disabled={phase !== "idle"}
          onClick={() => {
            setLeft(UNDO_MS);
            setPhase("undoable");
          }}
          className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-accent-fg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {phase === "idle" ? "发送邮件" : phase === "undoable" ? "发送中..." : "已送达"}
        </button>
      }
      onReset={onReset}
    >
      <div className="relative px-5 pt-4 pb-6">
        <h3 className="text-base font-semibold text-fg">发送合作方案</h3>

        {/* Post-action Undo Toast */}
        {phase !== "idle" && (
          <div
            className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 shadow-sm"
            role="status"
          >
            <p className="text-xs font-medium text-accent">
              {phase === "undoable" ? "邮件已加入发送队列，正发往周予" : "邮件已正式投递完成"}
            </p>
            {phase === "undoable" ? (
              <button
                type="button"
                className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-fg hover:bg-accent/90 transition-colors"
                onClick={() => setPhase("idle")}
              >
                撤回发送 · {seconds}s
              </button>
            ) : (
              <span className="text-xs text-fg-subtle">撤销窗口已结束</span>
            )}
          </div>
        )}

        <article className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">
                周
              </span>
              <div>
                <p className="text-xs font-semibold text-fg">周予 · 星河科技</p>
                <p className="text-[11px] text-fg-subtle">partner@xinghe.ai</p>
              </div>
            </div>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-fg-muted border border-border">
              外部联系人
            </span>
          </div>

          <h4 className="mt-4 text-xs font-semibold text-fg">AI 知识库合作方案 | 最终审定版</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
            周老师你好，附件是根据上午沟通调整后的完整落地路线图与验收排期，请查阅。
          </p>
        </article>

        <p className="mt-4 text-[11px] leading-relaxed text-fg-subtle">
          💡 <strong className="text-fg">规则解析：</strong>发邮件、归档、移入回收站等后果完全可逆的操作，直接乐观执行，并在视线焦点处提供 5 秒 Undo Toast，零打断且安全兜底。
        </p>
      </div>
    </MacWindow>
  );
}
