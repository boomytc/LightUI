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
    } catch {
      // keep the visual confirm even if clipboard is blocked
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="pressable inline-flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
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
      <pre className="overflow-x-auto border-t border-border pt-3 font-mono text-xs leading-relaxed whitespace-pre text-fg-muted">
        <code>{text}</code>
      </pre>
    </div>
  );
}
