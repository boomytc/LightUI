import type { RefObject } from "react";
import type { Point } from "../lib/geometry";
import type { AimBand } from "./types";

type Props = {
  mouse: Point | null;
  bands: AimBand[];
  visible: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /** Vertex dots help the live playground. Stage stills keep the region + pointer only. */
  vertices?: boolean;
};

export function TriangleOverlay({ mouse, bands, visible, containerRef, vertices = true }: Props) {
  if (!visible) return null;

  const box = containerRef.current?.getBoundingClientRect();
  const ox = box?.left ?? 0;
  const oy = box?.top ?? 0;
  const local = (p: Point): Point => ({ x: p.x - ox, y: p.y - oy });
  const confirm = bands.some((b) => b.color === "confirm");
  const stroke = confirm ? "#16a34a" : "#2f6bff";

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
        const fill = band.color === "confirm" ? "rgb(22 163 74 / 0.16)" : "rgb(47 107 255 / 0.18)";
        return (
          <g key={`${band.level}-${band.parentId}`}>
            <polygon
              points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
              fill={fill}
              stroke={band.color === "confirm" ? "#16a34a" : "#2f6bff"}
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            {vertices ? (
              <>
                <circle cx={a.x} cy={a.y} r="3.5" fill={band.color === "confirm" ? "#16a34a" : "#2f6bff"} />
                <circle cx={b.x} cy={b.y} r="3.5" fill={band.color === "confirm" ? "#16a34a" : "#2f6bff"} />
                <circle cx={c.x} cy={c.y} r="3.5" fill={band.color === "confirm" ? "#16a34a" : "#2f6bff"} />
              </>
            ) : null}
          </g>
        );
      })}
      {mouse ? (
        <g>
          <circle cx={local(mouse).x} cy={local(mouse).y} r="14" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx={local(mouse).x} cy={local(mouse).y} r="3.5" fill={stroke} />
        </g>
      ) : null}
    </svg>
  );
}
