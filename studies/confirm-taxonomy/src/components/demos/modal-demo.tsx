import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { MacWindow } from "../mac-window";

type DocumentItem = {
  id: string;
  title: string;
  updatedAt: string;
  size: string;
};

const INITIAL_DOCS: DocumentItem[] = [
  { id: "1", title: "核心产品需求规格说明书 (PRD v2.4)", updatedAt: "今天 14:20", size: "3.8 MB" },
  { id: "2", title: "架构评审会议纪要与架构图", updatedAt: "昨天 18:00", size: "1.2 MB" },
  { id: "3", title: "用户访谈录音逐字稿全量归档", updatedAt: "8月28日", size: "12.4 MB" },
];

export function ModalDemo() {
  const [seed, setSeed] = useState(0);
  return <ModalInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function ModalInner({ onReset }: { onReset: () => void }) {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [target, setTarget] = useState<DocumentItem | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!target) return;
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTarget(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target]);

  return (
    <MacWindow
      title="知识文档库 · 核心资产"
      eyebrow="Documents Repository"
      badge={
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-medium text-fg-muted border border-border">
          {docs.length} 篇核心文档
        </span>
      }
      onReset={onReset}
      className="relative"
    >
      <div className={cn("px-5 pt-4 pb-6", target && "pointer-events-none select-none")}>
        <h3 className="text-base font-semibold text-fg">核心知识资产列表</h3>
        <p className="mt-0.5 text-xs text-fg-muted">
          严重后果决策：蒙版全阻断，焦点锁定取消，禁止随便点遮罩关
        </p>

        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium text-fg">{doc.title}</h4>
                <p className="mt-0.5 text-[11px] text-fg-subtle">
                  {doc.updatedAt} · {doc.size}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTarget(doc)}
                className="rounded-lg bg-wrong-soft px-2.5 py-1 text-xs font-semibold text-wrong hover:bg-wrong hover:text-white transition-colors"
              >
                删除文档
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Global Blocking Modal Scrim */}
      {target && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-menu"
          >
            <span className="text-[10px] font-mono font-semibold tracking-wider text-wrong uppercase">
              Irreversible Document Deletion
            </span>
            <h4 id="modal-title" className="mt-1 text-sm font-semibold text-fg">
              永久删除「{target.title}」？
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">
              该文档属于团队核心知识资产。删除后将同时失效所有外部公开分享链接，且团队成员将立即失去访问权。
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => setTarget(null)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-2 transition-colors"
              >
                保留文档 (Esc)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocs((prev) => prev.filter((d) => d.id !== target.id));
                  setTarget(null);
                }}
                className="rounded-lg bg-wrong px-3 py-1.5 text-xs font-semibold text-white hover:bg-wrong/90 transition-colors"
              >
                确认永久删除
              </button>
            </div>
          </div>
        </div>
      )}
    </MacWindow>
  );
}
