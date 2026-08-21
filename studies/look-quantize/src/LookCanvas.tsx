import { useEffect, useRef } from "react";
import atlasUrl from "./assets/look-atlas.png";
import {
  CELL,
  PITCH_ROWS,
  YAW_COLS,
  blinkSourceRow,
  clamp,
  lookToCell,
  smoothToward,
  targetFromOffset,
  type LookVec,
} from "./lib/look";

export type LockedLook = { x: number; y: number; blink: boolean };

type Props = {
  radius: number;
  smoothing: number;
  lookY: number;
  autoBlink: boolean;
  showRadius: boolean;
  showGrid: boolean;
  locked?: LockedLook;
};

export function LookCanvas({
  radius,
  smoothing,
  lookY,
  autoBlink,
  showRadius,
  showGrid,
  locked,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef({ radius, smoothing, lookY, autoBlink, showRadius, showGrid, locked });
  paramsRef.current = { radius, smoothing, lookY, autoBlink, showRadius, showGrid, locked };

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

    const loop = (t: number) => {
      if (!running) return;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      const now = t / 1000;
      const p = paramsRef.current;

      if (p.locked) {
        look.x = p.locked.x;
        look.y = p.locked.y;
        blinking = p.locked.blink;
      } else {
        const target = targetFromOffset(pointer.x - origin.x, pointer.y - origin.y, p.radius, p.lookY);
        look.x = smoothToward(look.x, target.x, p.smoothing, dt);
        look.y = smoothToward(look.y, target.y, p.smoothing, dt);
        if (blinking && now >= blinkUntil) blinking = false;
        if (p.autoBlink && !blinking && now >= nextBlink) {
          blinking = true;
          blinkUntil = now + 0.11;
          nextBlink = now + 3.2 + Math.random() * 2.4;
        }
      }

      const { col, row } = lookToCell(look.x, look.y);
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      ctx.clearRect(0, 0, cssW, cssH);

      if (p.showGrid) {
        for (let r = 0; r < PITCH_ROWS; r++) {
          for (let c = 0; c < YAW_COLS; c++) {
            if (c === col && r === row) continue;
            drawCell(c, r, false, origin.x + (c - col) * displaySize, origin.y + (r - row) * displaySize, 0.18);
          }
        }
      }

      if (p.showRadius) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "#3b6cff";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.25;
        ctx.arc(origin.x, origin.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      drawCell(col, row, blinking, origin.x, origin.y, 1);

      if (p.showGrid) {
        ctx.save();
        ctx.strokeStyle = "#3b6cff";
        ctx.lineWidth = 2;
        ctx.strokeRect(origin.x - displaySize / 2, origin.y - displaySize / 2, displaySize, displaySize);
        ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "#3b6cff";
        ctx.textAlign = "center";
        ctx.fillText(`r${row + 1} · c${col + 1}`, origin.x, origin.y + displaySize / 2 + 18);
        ctx.restore();
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
      className="h-[min(70vh,28rem)] w-full touch-none rounded-2xl border border-border bg-bg-warm"
      aria-label="Gaze follows the pointer onto atlas cells"
    />
  );
}
