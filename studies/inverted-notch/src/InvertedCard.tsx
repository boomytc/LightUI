import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Lock, LockOpen } from "lucide-react";
import {
  DEFAULT_GEOM,
  chipWidth,
  hatchClipValue,
  notchSize,
  shapeClipValue,
  shapeSupports,
  svgPath,
  type Geom,
  type Technique,
} from "./lib/geometry";
import { cn } from "./lib/utils";
import "./notch.css";

const CARD_W = 300;
const CARD_H = 248;

export type InvertedCardProps = {
  technique: Technique;
  exploded: boolean;
  locked: boolean;
  chipOpen: boolean;
  interactive?: boolean;
  onToggleLocked?: () => void;
  onChipOpen?: (open: boolean) => void;
};

export function InvertedCard({
  technique,
  exploded,
  locked,
  chipOpen,
  interactive = true,
  onToggleLocked,
  onChipOpen,
}: InvertedCardProps) {
  const [canShape, setCanShape] = useState(true);
  const faceRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: CARD_W, h: CARD_H });

  useEffect(() => {
    setCanShape(shapeSupports());
  }, []);

  useEffect(() => {
    const el = faceRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setBox({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geom: Geom = { ...DEFAULT_GEOM, chipW: chipWidth(chipOpen) };
  const { nw, nh, ir } = notchSize(geom);
  const pathD = svgPath(box.w, box.h, geom);
  const usingShape = technique === "shape" && canShape;
  const usingScoop = technique === "scoop";
  const clip = usingShape ? shapeClipValue() : usingScoop ? "none" : `path("${pathD}")`;

  const vars = {
    "--r": `${geom.radius}px`,
    "--gap": `${geom.gap}px`,
    "--chip-w": `${geom.chipW}px`,
    "--chip-h": `${geom.chipH}px`,
    "--ir": `${ir}px`,
    "--nw": `${nw}px`,
    "--nh": `${nh}px`,
    "--card-w": `${CARD_W}px`,
    "--card-h": `${CARD_H}px`,
    "--spread": "88px",
    "--card-clip": usingShape ? shapeClipValue() : `path("${pathD}")`,
    "--card-clip-path": `path("${pathD}")`,
    "--hatch-clip": hatchClipValue(),
    "--hatch-angle": "-45deg",
  } as CSSProperties;

  return (
    <div className="inotch-stage" style={vars}>
      <div className={cn("inotch-assembly", exploded && "is-exploded")}>
        <div className="inotch-plane inotch-plane-base" aria-hidden="true">
          <div className="inotch-ghost" />
        </div>
        <div className="inotch-plane inotch-plane-face">
          <div
            ref={faceRef}
            className={cn(
              "inotch-card-face",
              usingScoop && "is-scoop",
              technique === "path" && "is-path",
              technique === "shape" && !canShape && "is-path",
            )}
            style={{ clipPath: usingScoop ? undefined : clip }}
          />
          <div className="inotch-hatch">
            <div className="inotch-hatch-fill" />
          </div>
        </div>
        <div className="inotch-plane inotch-plane-chip">
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
            {locked ? <Lock className="size-4 shrink-0" strokeWidth={2} /> : <LockOpen className="size-4 shrink-0" strokeWidth={2} />}
            <span className="inotch-chip-label">{locked ? "locked" : "unlocked"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
