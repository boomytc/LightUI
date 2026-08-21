export type Technique = "shape" | "path" | "scoop";

export const CHIP_W_CLOSED = 44;
export const CHIP_W_OPEN = 122;

export type Geom = {
  radius: number;
  gap: number;
  chipH: number;
  innerRadius: number;
  chipW: number;
};

export const DEFAULT_GEOM: Omit<Geom, "chipW"> = {
  radius: 18,
  gap: 7,
  chipH: 44,
  innerRadius: 20,
};

export function chipWidth(open: boolean): number {
  return open ? CHIP_W_OPEN : CHIP_W_CLOSED;
}

export function notchSize(g: Geom) {
  return {
    nw: g.chipW + g.gap,
    nh: g.chipH + g.gap,
    ir: Math.min(g.innerRadius, (g.chipW + g.gap) * 0.45, (g.chipH + g.gap) * 0.45),
  };
}

/** True when the technique punches a chip-sized hole, not a single-corner scoop. */
export function punchesChipHole(technique: Technique): boolean {
  return technique !== "scoop";
}

export function shapeClipValue(): string {
  return `shape(from var(--nw) 0px, hline to calc(100% - var(--r)), arc to 100% var(--r) of var(--r) cw, vline to calc(100% - var(--r)), arc to calc(100% - var(--r)) 100% of var(--r) cw, hline to var(--r), arc to 0px calc(100% - var(--r)) of var(--r) cw, vline to calc(var(--nh) - var(--ir)), arc to var(--ir) var(--nh) of var(--ir) ccw, hline to calc(var(--nw) - var(--ir)), arc to var(--nw) calc(var(--nh) - var(--ir)) of var(--ir) ccw, vline to var(--ir), arc to calc(var(--nw) - var(--ir)) 0px of var(--ir) ccw, close)`;
}

export function hatchClipValue(): string {
  return `shape(from 0px 0px, hline to calc(var(--nw) - var(--ir)), arc to var(--nw) var(--ir) of var(--ir) cw, vline to calc(var(--nh) - var(--ir)), arc to calc(var(--nw) - var(--ir)) var(--nh) of var(--ir) cw, hline to var(--ir), arc to 0px calc(var(--nh) - var(--ir)) of var(--ir) cw, close)`;
}

/** SVG `path()` fallback. Sweep 1 = cw, 0 = ccw. */
export function svgPath(w: number, h: number, g: Geom): string {
  const r = Math.min(g.radius, w / 2, h / 2);
  const { nw, nh, ir } = notchSize(g);
  const nwv = Math.min(nw, w * 0.7);
  const nhv = Math.min(nh, h * 0.7);
  const irv = Math.min(ir, nwv * 0.45, nhv * 0.45);

  const A = (rx: number, ry: number, sweep: 0 | 1, x: number, y: number) =>
    `A ${rx} ${ry} 0 0 ${sweep} ${x} ${y}`;

  return [
    `M ${nwv} 0`,
    `H ${w - r}`,
    A(r, r, 1, w, r),
    `V ${h - r}`,
    A(r, r, 1, w - r, h),
    `H ${r}`,
    A(r, r, 1, 0, h - r),
    `V ${nhv - irv}`,
    A(irv, irv, 0, irv, nhv),
    `H ${nwv - irv}`,
    A(irv, irv, 0, nwv, nhv - irv),
    `V ${irv}`,
    A(irv, irv, 0, nwv - irv, 0),
    `Z`,
  ].join(" ");
}

export function pathStartX(w: number, g: Geom): number {
  const { nw } = notchSize(g);
  return Math.min(nw, w * 0.7);
}

export function scoopCornerCss(radius: number): string {
  return `border-radius: ${radius}px;\ncorner-shape: scoop round round round;`;
}

export function prettyShapeCss(): string {
  return `clip-path: shape(
  from var(--nw) 0px,
  hline to calc(100% - var(--r)),
  arc to 100% var(--r) of var(--r) cw,
  vline to calc(100% - var(--r)),
  arc to calc(100% - var(--r)) 100% of var(--r) cw,
  hline to var(--r),
  arc to 0px calc(100% - var(--r)) of var(--r) cw,
  vline to calc(var(--nh) - var(--ir)),
  arc to var(--ir) var(--nh) of var(--ir) ccw,
  hline to calc(var(--nw) - var(--ir)),
  arc to var(--nw) calc(var(--nh) - var(--ir)) of var(--ir) ccw,
  vline to var(--ir),
  arc to calc(var(--nw) - var(--ir)) 0px of var(--ir) ccw,
  close
);`;
}

export function shapeSupports(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("clip-path", "shape(from 0 0, hline to 100%, vline to 100%, close)");
}

export function scoopSupports(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("corner-shape: scoop");
}
