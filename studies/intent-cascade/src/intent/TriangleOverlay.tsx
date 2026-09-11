import { useEffect, useState, type RefObject } from "react";
import { dist, type Point } from "../lib/geometry";
import type { Locale } from "../lib/site-locale";
import type { AimBand } from "./types";

type Props = {
  mouse: Point | null;
  bands: AimBand[];
  visible: boolean;
  containerRef: RefObject<HTMLElement | null>;
  locale?: Locale;
  /** Vertex dots help the live playground. Stage stills keep the region + pointer only. */
  vertices?: boolean;
};

const TRAIL = 14;

export function TriangleOverlay({
  mouse,
  bands,
  visible,
  containerRef,
  locale = "zh",
  vertices = true,
}: Props) {
  const [trail, setTrail] = useState<Point[]>([]);

  useEffect(() => {
    if (!mouse) {
      setTrail([]);
      return;
    }
    setTrail((prev) => {
      const last = prev.at(-1);
      if (last && dist(last, mouse) < 3) return prev;
      return [...prev.slice(-(TRAIL - 1)), mouse];
    });
  }, [mouse]);

  if (!visible) return null;

  const box = containerRef.current?.getBoundingClientRect();
  const ox = box?.left ?? 0;
  const oy = box?.top ?? 0;
  const local = (p: Point): Point => ({ x: p.x - ox, y: p.y - oy });
  const confirm = bands.some((b) => b.color === "confirm");
  const stroke = confirm ? "#16a34a" : "#2f6bff";
  const trailPts = trail.map(local);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {trailPts.length > 1 ? (
        <polyline
          points={trailPts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
        />
      ) : null}

      {bands.map((band) => {
        const { cursor, top, bottom } = band.triangle;
        const a = local(cursor);
        const b = local(top);
        const c = local(bottom);
        const mid = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
        const fill = band.color === "confirm" ? "rgb(22 163 74 / 0.16)" : "rgb(47 107 255 / 0.18)";
        const color = band.color === "confirm" ? "#16a34a" : "#2f6bff";
        const label =
          band.color === "confirm"
            ? locale === "en"
              ? "locked"
              : "已锁定"
            : locale === "en"
              ? "corridor"
              : "意图走廊";
        const cx = (a.x + b.x + c.x) / 3;
        const cy = (a.y + b.y + c.y) / 3;
        return (
          <g key={`${band.level}-${band.parentId}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={mid.x}
              y2={mid.y}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.45"
            />
            <polygon
              points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
              fill={fill}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            {vertices ? (
              <>
                <circle cx={a.x} cy={a.y} r="3.5" fill={color} />
                <circle cx={b.x} cy={b.y} r="3.5" fill={color} />
                <circle cx={c.x} cy={c.y} r="3.5" fill={color} />
                <VertexLabel x={a.x} y={a.y} text={locale === "en" ? "ptr" : "指针"} color={color} />
                <VertexLabel x={b.x} y={b.y - 10} text={locale === "en" ? "top" : "顶"} color={color} />
                <VertexLabel x={c.x} y={c.y + 14} text={locale === "en" ? "bot" : "底"} color={color} />
                <text
                  x={cx}
                  y={cy}
                  fill={color}
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {label}
                </text>
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

function VertexLabel({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return (
    <text
      x={x + 8}
      y={y + 3}
      fill={color}
      fontSize="9"
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      opacity="0.85"
    >
      {text}
    </text>
  );
}
