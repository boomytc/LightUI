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
        {phase !== "idle" && (
          <div
            className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-soft px-3.5 py-2.5 shadow-sm"
            role="status"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-accent">
                {phase === "undoable" ? "已加入发送队列 · 周予" : "已正式投递"}
              </p>
              <p className="mt-0.5 text-[10px] text-accent/70">
                {phase === "undoable" ? "无需事前确认，事后 5 秒可撤回" : "撤销窗口已关闭"}
              </p>
            </div>
            {phase === "undoable" ? (
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-fg transition-colors hover:bg-accent/90"
                onClick={() => setPhase("idle")}
              >
                <span
                  aria-hidden="true"
                  className="relative size-4 overflow-hidden rounded-full bg-accent-fg/20"
                >
                  <span
                    className="absolute inset-0 origin-center bg-accent-fg/55"
                    style={{
                      clipPath: `inset(0 ${100 - (left / UNDO_MS) * 100}% 0 0)`,
                    }}
                  />
                </span>
                撤回 · {seconds}s
              </button>
            ) : (
              <span className="text-[11px] text-fg-subtle">已送达</span>
            )}
          </div>
        )}

        <h3 className="text-base font-semibold text-fg">发送合作方案</h3>

        <article className="mt-3 rounded-xl border border-border bg-surface-2/50 p-4">
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
          发信、归档、移入废纸篓：先执行，再给后悔期。倒计时结束才真正提交。
        </p>
      </div>
    </MacWindow>
  );
}
