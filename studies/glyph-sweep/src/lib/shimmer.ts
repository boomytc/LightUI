export const STYLES = ["classic", "aurora", "flame"] as const;
export type ShimmerStyle = (typeof STYLES)[number];

export const GRADIENT_SIZE = "300% 100%";
export const SPREAD_UNIT = "ch";

/** Seconds per character. Larger = slower sweep. */
export const PER_CHAR_SLOW = 0.2;
export const PER_CHAR_FAST = 0.05;
export const PER_CHAR_DEFAULT = 0.12;

export function durationSeconds(charCount: number, secondsPerChar: number): number {
  return Math.max(1, charCount) * secondsPerChar;
}

/**
 * UI pace: 0 = slow, 1 = fast.
 * Maps onto seconds-per-character so the speed slider is not inverted.
 */
export function secondsPerCharFromPace(pace: number): number {
  const t = Math.min(1, Math.max(0, pace));
  const raw = PER_CHAR_SLOW + (PER_CHAR_FAST - PER_CHAR_SLOW) * t;
  return Math.round(raw * 100) / 100;
}

export function paceFromSecondsPerChar(secondsPerChar: number): number {
  const span = PER_CHAR_FAST - PER_CHAR_SLOW;
  return (secondsPerChar - PER_CHAR_SLOW) / span;
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
  0%   { background-position: 100% 0, 0 0; }
  72%  { background-position: 0 0, 0 0; }
  100% { background-position: 0 0, 0 0; }
}`;
}

export function buildSnippet(cfg: {
  style: ShimmerStyle;
  spread: number;
  angle: number;
  secondsPerChar: number;
}): string {
  return `.glyph-sweep {
  --spread: ${cfg.spread};
  --angle: ${cfg.angle}deg;
  --per-char: ${cfg.secondsPerChar}s;
  --len: 24;
  --offset: ${spreadOffsetCss(cfg.spread)};
  color: transparent;
  background:
    linear-gradient(var(--angle), ${bandStops(cfg.style)})
      0 0 / ${GRADIENT_SIZE} no-repeat,
    linear-gradient(color-mix(in oklab, var(--color-fg) 22%, transparent), color-mix(in oklab, var(--color-fg) 22%, transparent));
  -webkit-background-clip: text;
  background-clip: text;
  animation: glyph-sweep calc(var(--len) * var(--per-char))
    infinite both ease-in-out;
}
${keyframes()}`;
}
