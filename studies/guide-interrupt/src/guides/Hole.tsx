import type { CSSProperties, ReactNode } from "react";
import type { Cutout } from "../lib/machines";

export function HoleScrim({
  hole,
  blockHole,
  children,
}: {
  hole: Cutout;
  blockHole: boolean;
  children?: ReactNode;
}) {
  const { x, y, w, h } = hole;
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" data-guide-scrim="">
      <div className="guide-pane pointer-events-auto absolute top-0 right-0 left-0" style={{ height: Math.max(0, y) }} />
      <div
        className="guide-pane pointer-events-auto absolute left-0"
        style={{ top: y, width: Math.max(0, x), height: h }}
      />
      <div
        className="guide-pane pointer-events-auto absolute right-0"
        style={{ top: y, left: x + w, height: h }}
      />
      <div className="guide-pane pointer-events-auto absolute right-0 bottom-0 left-0" style={{ top: y + h }} />
      {blockHole ? (
        <div className="pointer-events-auto absolute" style={{ left: x, top: y, width: w, height: h }} />
      ) : null}
      <div className="guide-ring pointer-events-none absolute" style={{ left: x, top: y, width: w, height: h }} />
      {children}
    </div>
  );
}

export function AnchorCard({
  hole,
  host,
  width = 244,
  children,
}: {
  hole: Cutout;
  host: { w: number; h: number };
  width?: number;
  children: ReactNode;
}) {
  const preferBelow = hole.y + hole.h < host.h * 0.58;
  const left = Math.max(12, Math.min(hole.x, Math.max(12, host.w - width - 12)));
  const style: CSSProperties = preferBelow
    ? { left, top: hole.y + hole.h + 10, width }
    : { left, width, top: Math.max(12, hole.y - 10), transform: "translateY(-100%)" };

  return (
    <div className="pointer-events-auto absolute z-50" style={style}>
      {children}
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
      style={{ left: hole.x + hole.w - 8, top: hole.y - 5 }}
    >
      <span className="guide-hotspot-core" />
    </button>
  );
}
