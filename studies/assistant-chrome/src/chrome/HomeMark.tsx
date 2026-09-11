import type { KindId } from "../lib/kinds";
import { cn } from "../lib/utils";

export function HomeMark({ id, on }: { id: KindId; on: boolean }) {
  return (
    <svg viewBox="0 0 64 40" className={cn("chrome-mark", on && "is-on")} aria-hidden="true">
      <rect className="chrome-mark-page" x="3.5" y="2.5" width="57" height="35" rx="5" />
      {id === "chat" ? <ChatMass /> : null}
      {id === "panel" ? <PanelMass /> : null}
      {id === "plugin" ? <PluginMass /> : null}
      {id === "float" ? <FloatMass /> : null}
      {id === "canvas" ? <CanvasMass /> : null}
      {id === "invisible" ? <InvisibleMass /> : null}
    </svg>
  );
}

function ChatMass() {
  return (
    <>
      <rect className="chrome-mark-mass" x="8" y="7" width="24" height="6" rx="2" />
      <rect className="chrome-mark-mass" x="30" y="15" width="26" height="6" rx="2" />
      <rect className="chrome-mark-mass" x="8" y="23" width="20" height="6" rx="2" />
      <rect className="chrome-mark-mass" x="8" y="31" width="48" height="4.5" rx="1.6" />
    </>
  );
}

function PanelMass() {
  return (
    <>
      <rect className="chrome-mark-host" x="7" y="6" width="32" height="28" rx="2" />
      <rect className="chrome-mark-mass" x="40" y="6" width="17" height="28" rx="2" />
    </>
  );
}

function PluginMass() {
  return (
    <>
      <path className="chrome-mark-line" d="M10 12h28" />
      <path className="chrome-mark-line" d="M10 18h36" />
      <path className="chrome-mark-line" d="M10 24h24" />
      <path className="chrome-mark-line" d="M10 30h32" />
      <rect className="chrome-mark-mass" x="16" y="15.4" width="16" height="5.2" rx="1.2" />
      <rect className="chrome-mark-mass" x="20" y="7" width="20" height="5.5" rx="1.6" />
    </>
  );
}

function FloatMass() {
  return (
    <>
      <path className="chrome-mark-line" d="M10 11h36" />
      <path className="chrome-mark-line" d="M10 17h28" />
      <path className="chrome-mark-line" d="M10 23h32" />
      <circle className="chrome-mark-mass" cx="50" cy="29.5" r="5.2" />
    </>
  );
}

function CanvasMass() {
  return (
    <>
      <path
        className="chrome-mark-link"
        d="M24 14 C 30 14, 30 20, 36 20"
        fill="none"
      />
      <rect className="chrome-mark-mass" x="10" y="8" width="15" height="11" rx="2" />
      <rect className="chrome-mark-mass" x="36" y="14" width="15" height="11" rx="2" />
      <rect className="chrome-mark-mass" x="20" y="24" width="15" height="10" rx="2" />
    </>
  );
}

function InvisibleMass() {
  return (
    <>
      <path className="chrome-mark-line" d="M10 12h34" />
      <path className="chrome-mark-line" d="M10 18h28" />
      <path className="chrome-mark-line" d="M10 24h32" />
      <path className="chrome-mark-line" d="M10 30h22" />
      <circle className="chrome-mark-ghost" cx="50" cy="29.5" r="5.2" />
    </>
  );
}
