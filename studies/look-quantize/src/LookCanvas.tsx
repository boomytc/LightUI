import { useEffect, useRef } from "react";
import atlasUrl from "./assets/look-atlas.png";
import "./look.css";
import {
  CELL,
  PITCH_ROWS,
  YAW_COLS,
  blinkSourceRow,
  clamp,
  lookToCell,
  smoothToward,
  targetFromOffset,
  type LookCell,
  type LookVec,
} from "./lib/look";

export type LockedLook = { x: number; y: number; blink: boolean };

export type LookSample = {
  lookX: number;
  lookY: number;
  col: number;
  row: number;
  blink: boolean;
  clamped: boolean;
  srcRow: number;
};

type Props = {
  radius: number;
  smoothing: number;
  lookY: number;
  autoBlink: boolean;
  showRadius: boolean;
  showGrid: boolean;
  blinkPulse?: number;
  locked?: LockedLook;
  onSample?: (sample: LookSample) => void;
};

type Theme = {
  accent: string;
  intent: string;
  fg: string;
  muted: string;
  border: string;
};

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    accent: pick("--color-accent", "#3b6cff"),
    intent: pick("--color-intent", "#16a34a"),
    fg: pick("--color-fg", "#17181c"),
    muted: pick("--color-fg-muted", "#5c616b"),
    border: pick("--color-border-strong", "rgba(23,24,28,0.14)"),
  };
}

function cellLookBounds(col: number, row: number) {
  return {
    x0: ((col - 0.5) / (YAW_COLS - 1)) * 2 - 1,
    x1: ((col + 0.5) / (YAW_COLS - 1)) * 2 - 1,
    y0: ((row - 0.5) / (PITCH_ROWS - 1)) * 2 - 1,
    y1: ((row + 0.5) / (PITCH_ROWS - 1)) * 2 - 1,
  };
}

export function LookCanvas({
  radius,
  smoothing,
  lookY,
  autoBlink,
  showRadius,
  showGrid,
  blinkPulse = 0,
  locked,
  onSample,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef({
    radius,
    smoothing,
    lookY,
    autoBlink,
    showRadius,
    showGrid,
    blinkPulse,
    locked,
    onSample,
  });
  paramsRef.current = {
    radius,
    smoothing,
    lookY,
    autoBlink,
    showRadius,
    showGrid,
    blinkPulse,
    locked,
    onSample,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const atlas = new Image();
    atlas.src = atlasUrl;

    const pointer = { x: 0, y: 0, has: false };
    const look: LookVec = { x: 0, y: 0 };
    const origin = { x: 0, y: 0 };
    let displaySize = 220;
    let dpr = 1;
    let last = performance.now();
    let raf = 0;
    let running = true;
    let blinking = false;
    let blinkUntil = 0;
    let nextBlink = performance.now() / 1000 + 1.2;
    let lastPulse = paramsRef.current.blinkPulse;
    let hopUntil = 0;
    let lastCell: LookCell = { col: 6, row: 1 };
    let lastSig = "";
    const reduce =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      origin.x = rect.width * 0.5;
      origin.y = rect.height * 0.48;
      displaySize = clamp(Math.min(rect.width, rect.height) * 0.42, 140, 280);
      if (!pointer.has) {
        pointer.x = origin.x;
        pointer.y = origin.y;
      }
    };

    const onPointer = (e: PointerEvent) => {
      if (paramsRef.current.locked) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.has = true;
    };

    const lookPoint = (lx: number, ly: number, rad: number) => ({
      x: origin.x + lx * rad,
      y: origin.y + ly * rad,
    });

    const drawCell = (col: number, row: number, blink: boolean, x: number, y: number, alpha: number) => {
      if (!atlas.complete || atlas.naturalWidth === 0) return;
      const srcRow = blinkSourceRow(row, blink);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const left = x - displaySize / 2;
      const top = y - displaySize / 2;
      ctx.drawImage(atlas, col * CELL, srcRow * CELL, CELL, CELL, left, top, displaySize, displaySize);
      ctx.restore();
    };

    const drawLattice = (rad: number, cell: LookCell, theme: Theme, hopping: boolean) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, rad, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      for (let r = 0; r < PITCH_ROWS; r++) {
        for (let c = 0; c < YAW_COLS; c++) {
          const b = cellLookBounds(c, r);
          const p0 = lookPoint(b.x0, b.y0, rad);
          const p1 = lookPoint(b.x1, b.y1, rad);
          const on = c === cell.col && r === cell.row;
          ctx.beginPath();
          ctx.strokeStyle = on ? theme.accent : theme.border;
          ctx.lineWidth = on ? (hopping ? 2.5 : 1.75) : 1;
          ctx.globalAlpha = on ? 1 : 0.45;
          ctx.roundRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 4);
          ctx.stroke();
          if (on) {
            ctx.fillStyle = theme.accent;
            ctx.globalAlpha = hopping ? 0.16 : 0.08;
            ctx.fill();
          }
        }
      }
      ctx.restore();
    };

    const drawVector = (
      target: LookVec,
      rad: number,
      theme: Theme,
      clamped: boolean,
    ) => {
      const lookPx = lookPoint(look.x, look.y, rad);
      const targetPx = lookPoint(target.x, target.y, rad);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(lookPx.x, lookPx.y);
      ctx.strokeStyle = theme.accent;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(targetPx.x, targetPx.y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = theme.muted;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lookPx.x, lookPx.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 1;
      ctx.fill();

      if (clamped) {
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, rad, 0, Math.PI * 2);
        ctx.strokeStyle = theme.intent;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
    };

    const loop = (t: number) => {
      if (!running) return;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      const now = t / 1000;
      const p = paramsRef.current;
      const theme = readTheme();
      let target: LookVec = { x: look.x, y: look.y };
      let clamped = false;

      if (p.locked) {
        look.x = p.locked.x;
        look.y = p.locked.y;
        blinking = p.locked.blink;
        target = { x: look.x, y: look.y };
      } else {
        const dx = pointer.x - origin.x;
        const dy = pointer.y - origin.y;
        const rawLen = Math.hypot(dx / Math.max(p.radius, 1), (dy / Math.max(p.radius, 1)) * p.lookY);
        clamped = rawLen > 1;
        target = targetFromOffset(dx, dy, p.radius, p.lookY);
        look.x = smoothToward(look.x, target.x, p.smoothing, dt);
        look.y = smoothToward(look.y, target.y, p.smoothing, dt);

        if (p.blinkPulse !== lastPulse) {
          lastPulse = p.blinkPulse;
          blinking = true;
          blinkUntil = now + 0.11;
        }
        if (blinking && now >= blinkUntil) blinking = false;
        if (p.autoBlink && !reduce && !blinking && now >= nextBlink) {
          blinking = true;
          blinkUntil = now + 0.11;
          nextBlink = now + 3.2 + Math.random() * 2.4;
        }
      }

      const cell = lookToCell(look.x, look.y);
      if (cell.col !== lastCell.col || cell.row !== lastCell.row) {
        lastCell = cell;
        if (!reduce) hopUntil = now + 0.18;
      }

      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      ctx.clearRect(0, 0, cssW, cssH);

      if (!p.locked && p.showRadius) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = theme.accent;
        ctx.globalAlpha = 0.05;
        ctx.arc(origin.x, origin.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = theme.accent;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.25;
        ctx.arc(origin.x, origin.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (!p.locked && p.showGrid) {
        drawLattice(p.radius, cell, theme, now < hopUntil);
      }

      drawCell(cell.col, cell.row, blinking, origin.x, origin.y, 1);

      if (!p.locked) {
        drawVector(target, p.radius, theme, clamped);
        ctx.save();
        ctx.font = "600 12px IBM Plex Sans, Noto Sans SC, system-ui, sans-serif";
        ctx.fillStyle = theme.accent;
        ctx.textAlign = "center";
        const src = blinkSourceRow(cell.row, blinking);
        ctx.fillText(
          blinking
            ? `r${cell.row + 1} · c${cell.col + 1}  →  src ${src + 1}`
            : `r${cell.row + 1} · c${cell.col + 1}`,
          origin.x,
          origin.y + displaySize / 2 + 20,
        );
        ctx.restore();
      }

      const sig = `${cell.col},${cell.row},${blinking ? 1 : 0},${look.x.toFixed(2)},${look.y.toFixed(2)},${clamped ? 1 : 0}`;
      if (sig !== lastSig) {
        lastSig = sig;
        p.onSample?.({
          lookX: look.x,
          lookY: look.y,
          col: cell.col,
          row: cell.row,
          blink: blinking,
          clamped,
          srcRow: blinkSourceRow(cell.row, blinking),
        });
      }

      raf = requestAnimationFrame(loop);
    };

    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    const start = () => {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    atlas.onload = start;
    if (atlas.complete) start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="look-canvas h-[min(70vh,28rem)] w-full touch-none"
      aria-label="Gaze follows the pointer onto atlas cells"
    />
  );
}
