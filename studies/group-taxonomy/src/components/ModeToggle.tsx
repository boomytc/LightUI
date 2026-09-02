import type { GroupMode } from "../lib/machines.js";

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: GroupMode;
  onChange: (mode: GroupMode) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-full border border-border bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => onChange("cards")}
          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
            mode === "cards"
              ? "bg-surface text-fg shadow-sm border border-border"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          默认卡片
        </button>
        <button
          type="button"
          onClick={() => onChange("grouped")}
          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
            mode === "grouped"
              ? "bg-accent text-accent-fg shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          语义分组
        </button>
      </div>
      <kbd className="hidden sm:inline-block rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-subtle">
        T 对照
      </kbd>
    </div>
  );
}
