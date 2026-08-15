import type { Point } from "../lib/geometry";
import type { AimBand } from "./types";

type Props = {
  mouse: Point | null;
  bands: AimBand[];
  visible: boolean;
};

export function TriangleOverlay({ mouse, bands, visible }: Props) {
  if (!visible) return null;

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-visible"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {bands.map((band) => {
        const { cursor, top, bottom } = band.triangle;
        const confirm = band.color === "confirm";
        const fill = confirm ? "rgb(22 163 74 / 0.12)" : "rgb(47 107 255 / 0.14)";
        const stroke = confirm ? "#16a34a" : "#2f6bff";
        const pts = `${cursor.x},${cursor.y} ${top.x},${top.y} ${bottom.x},${bottom.y}`;
        return (
          <g key={`${band.level}-${band.parentId}`}>
            <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray="5 4" />
            <circle cx={cursor.x} cy={cursor.y} r="3.5" fill={stroke} />
            <circle cx={top.x} cy={top.y} r="3.5" fill={stroke} />
            <circle cx={bottom.x} cy={bottom.y} r="3.5" fill={stroke} />
          </g>
        );
      })}
      {mouse ? (
        <circle
          cx={mouse.x}
          cy={mouse.y}
          r="13"
          fill="none"
          stroke={bands.some((b) => b.color === "confirm") ? "#16a34a" : "#2f6bff"}
          strokeWidth="2"
          opacity="0.55"
        />
      ) : null}
    </svg>
  );
}
