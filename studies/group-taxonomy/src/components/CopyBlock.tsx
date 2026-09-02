import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-xs font-medium text-fg-muted uppercase tracking-wider">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="pressable inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-fg-muted transition-colors hover:text-fg hover:border-border-strong"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-intent" />
              <span className="text-intent">已复制</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto rounded-lg bg-surface p-3.5 text-fg-muted border border-border">
        <code>{text}</code>
      </pre>
    </div>
  );
}
