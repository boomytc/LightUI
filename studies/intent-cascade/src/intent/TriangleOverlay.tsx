import type { RefObject } from "react";
import type { Point } from "../lib/geometry";
import type { AimBand } from "./types";

type Props = {
  mouse: Point | null;
  bands: AimBand[];
  visible: boolean;
  containerRef: RefObject<HTMLElement | null>;
};

export function TriangleOverlay({ mouse, bands, visible, containerRef }: Props) {
  if (!visible) return null;

  const box = containerRef.current?.getBoundingClientRect();
  const ox = box?.left ?? 0;
  const oy = box?.top ?? 0;
  const local = (p: Point): Point => ({ x: p.x - ox, y: p.y - oy });

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {bands.map((band) => {
        const { cursor, top, bottom } = band.triangle;
        const a = local(cursor);
        const b = local(top);
        const c = local(bottom);
        const confirm = band.color === "confirm";
        const fill = confirm ? "rgb(22 163 74 / 0.12)" : "rgb(47 107 255 / 0.14)";
        const stroke = confirm ? "#16a34a" : "#2f6bff";
        return (
          <g key={`${band.level}-${band.parentId}`}>
            <polygon
              points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <circle cx={a.x} cy={a.y} r="3.5" fill={stroke} />
            <circle cx={b.x} cy={b.y} r="3.5" fill={stroke} />
            <circle cx={c.x} cy={c.y} r="3.5" fill={stroke} />
          </g>
        );
      })}
      {mouse ? (
        <circle
          cx={local(mouse).x}
          cy={local(mouse).y}
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
