export const STYLES = ["classic", "aurora", "flame"] as const;
export type ShimmerStyle = (typeof STYLES)[number];

export const GRADIENT_SIZE = "300% 100%";
export const SPREAD_UNIT = "ch";

export function durationSeconds(charCount: number, speed: number): number {
  return Math.max(1, charCount) * speed;
}

/** Half-width of the band, in `ch`, so it tracks type size. */
export function spreadCh(spread: number): string {
  return `${spread * 0.5}${SPREAD_UNIT}`;
}

export function spreadOffsetCss(spread: number): string {
  return `calc(${spread} * 0.5${SPREAD_UNIT})`;
}

export function bandStops(style: ShimmerStyle): string {
  if (style === "aurora") {
    return `#0000 calc(50% - var(--offset)), #a960ee, #ff333d, #ffcb57, #90e0ff, #0000 calc(50% + var(--offset))`;
  }
  if (style === "flame") {
    return `#0000 calc(50% - var(--offset)), hsl(45 100% 60%) calc(50% - (var(--offset) - 0.5ch)), hsl(0 100% 50%), #0000 calc(50% + var(--offset))`;
  }
  return `#0000 calc(50% - var(--offset)), var(--color-fg), #0000 calc(50% + var(--offset))`;
}

export function keyframes(): string {
  return `@keyframes glyph-sweep {
  0%       { background-position: 100% 0, 0 0; }
  50%, 100%{ background-position: 0 0, 0 0; }
}`;
}

export function buildSnippet(cfg: { style: ShimmerStyle; spread: number; angle: number; speed: number }): string {
  return `.glyph-sweep {
  --spread: ${cfg.spread};
  --angle: ${cfg.angle}deg;
  --speed: ${cfg.speed};
  --len: 24;
  --offset: ${spreadOffsetCss(cfg.spread)};
  color: transparent;
  background:
    linear-gradient(var(--angle), ${bandStops(cfg.style)})
      0 0 / ${GRADIENT_SIZE} no-repeat,
    linear-gradient(var(--color-fg-muted), var(--color-fg-muted));
  -webkit-background-clip: text;
  background-clip: text;
  animation: glyph-sweep calc(var(--len) * var(--speed) * 1s)
    infinite both ease-in-out;
}
${keyframes()}`;
}
