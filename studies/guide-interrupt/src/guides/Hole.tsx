import type { CSSProperties, ReactNode } from "react";
import type { Cutout } from "../lib/machines";
import { cn } from "../lib/utils";

export function HoleScrim({
  hole,
  blockHole,
  invite = false,
  children,
}: {
  hole: Cutout;
  blockHole: boolean;
  invite?: boolean;
  children?: ReactNode;
}) {
  const { x, y, w, h } = hole;
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" data-guide-scrim="">
      <div className="guide-hit absolute top-0 right-0 left-0" style={{ height: Math.max(0, y) }} />
      <div className="guide-hit absolute left-0" style={{ top: y, width: Math.max(0, x), height: h }} />
      <div className="guide-hit absolute right-0" style={{ top: y, left: x + w, height: h }} />
      <div className="guide-hit absolute right-0 bottom-0 left-0" style={{ top: y + h }} />
      {blockHole ? <div className="guide-hit absolute" style={{ left: x, top: y, width: w, height: h }} /> : null}
      <div
        className={cn("guide-aperture pointer-events-none absolute", invite && "is-invite")}
        style={{ left: x, top: y, width: w, height: h }}
      />
      {children}
    </div>
  );
}

export function PinRing({ hole }: { hole: Cutout }) {
  return (
    <div
      className="guide-pin-ring"
      data-guide-pin-ring=""
      style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }}
    />
  );
}

export function AnchorCard({
  hole,
  host,
  width = 244,
  tone = "paper",
  children,
}: {
  hole: Cutout;
  host: { w: number; h: number };
  width?: number;
  tone?: "ink" | "paper" | "hint";
  children: ReactNode;
}) {
  const spaceBelow = host.h - (hole.y + hole.h);
  const spaceAbove = hole.y;
  const preferBelow = spaceBelow >= 132 || spaceBelow >= spaceAbove;
  const left = Math.max(12, Math.min(hole.x, Math.max(12, host.w - width - 12)));
  const holeCx = hole.x + hole.w / 2;
  const caretLeft = Math.max(18, Math.min(holeCx - left, width - 18));
  const style: CSSProperties = preferBelow
    ? { left, top: hole.y + hole.h + 12, width }
    : { left, width, top: Math.max(12, hole.y - 12), transform: "translateY(-100%)" };

  return (
    <div className="guide-float pointer-events-auto absolute z-50" style={style}>
      <div
        className={cn(
          "relative rounded-xl shadow-menu",
          tone === "ink" && "bg-fg text-surface",
          tone === "paper" && "border border-border bg-surface text-fg",
          tone === "hint" && "border border-accent/30 bg-accent-soft text-fg shadow-card",
        )}
      >
        <i
          aria-hidden="true"
          className={cn(
            "guide-caret",
            preferBelow ? "is-above" : "is-below",
            tone === "ink" && "is-ink",
            tone === "paper" && "is-paper",
            tone === "hint" && "is-hint",
          )}
          style={{ left: caretLeft }}
        />
        {children}
      </div>
    </div>
  );
}

export function HotspotDot({
  hole,
  label,
  onClick,
}: {
  hole: Cutout;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="guide-hotspot"
      aria-label={label}
      onClick={onClick}
      style={{ left: hole.x + hole.w - 14, top: hole.y - 10 }}
    >
      <span className="guide-hotspot-core" />
    </button>
  );
}
