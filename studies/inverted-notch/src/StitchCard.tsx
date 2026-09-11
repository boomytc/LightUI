import type { CSSProperties } from "react";
import { Lock, LockOpen } from "lucide-react";
import {
  CHIP_W_CLOSED,
  DEFAULT_GEOM,
  chipWidth,
  notchSize,
} from "./lib/geometry";
import { cn } from "./lib/utils";
import { CardCopy } from "./InvertedCard";

const CARD_W = 300;
const CARD_H = 248;

export function StitchCard({
  locked,
  chipOpen,
  interactive = true,
  onToggleLocked,
  onChipOpen,
}: {
  locked: boolean;
  chipOpen: boolean;
  interactive?: boolean;
  onToggleLocked?: () => void;
  onChipOpen?: (open: boolean) => void;
}) {
  const geom = { ...DEFAULT_GEOM, chipW: chipWidth(chipOpen) };
  const live = notchSize(geom);
  const closed = notchSize({ ...DEFAULT_GEOM, chipW: CHIP_W_CLOSED });

  return (
    <div
      className="inotch-stage"
      style={
        {
          "--r": `${DEFAULT_GEOM.radius}px`,
          "--gap": `${DEFAULT_GEOM.gap}px`,
          "--chip-w": `${geom.chipW}px`,
          "--chip-h": `${DEFAULT_GEOM.chipH}px`,
          "--ir": `${closed.ir}px`,
          "--nw": `${live.nw}px`,
          "--nh": `${live.nh}px`,
          "--patch-w": `${closed.nw}px`,
          "--patch-h": `${closed.nh}px`,
          "--card-w": `${CARD_W}px`,
          "--card-h": `${CARD_H}px`,
        } as CSSProperties
      }
    >
      <div className="inotch-stitch">
        <div className="inotch-stitch-face">
          <span className="inotch-stitch-patch" aria-hidden="true" />
          <CardCopy />
        </div>
        <button
          type="button"
          className={cn("inotch-chip", chipOpen && "is-open")}
          aria-pressed={locked}
          disabled={!interactive}
          onPointerEnter={() => onChipOpen?.(true)}
          onPointerLeave={() => onChipOpen?.(false)}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLocked?.();
          }}
        >
          {locked ? (
            <Lock className="size-4 shrink-0" strokeWidth={2} />
          ) : (
            <LockOpen className="size-4 shrink-0" strokeWidth={2} />
          )}
          <span className="inotch-chip-label">{locked ? "locked" : "unlocked"}</span>
        </button>
      </div>
    </div>
  );
}
