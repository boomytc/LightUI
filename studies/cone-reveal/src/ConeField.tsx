import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_BEAM_WIDTH,
  DEFAULT_SWEEP_SPEED,
  DEMO_SECRET,
  PARK_ANGLE,
  angleTo,
  beamHalfAngle,
  fieldAim,
  peekAim,
  lerpAngle,
  nearestIndex,
  revealGlyphs,
  sameReveal,
  searchAngle,
  toggleReveal,
  type Point,
  type RevealKind,
} from "./lib/machines";
import "./cone-reveal.css";

const BULLET = "•";
const AWAKE_SPEED = 5.5;
const POINTER_HOLD_MS = 850;

export type ConeFieldProps = {
  kind: RevealKind;
  awake: boolean;
  beamWidth?: number;
  followPointer?: boolean;
  autoSearch?: boolean;
  sweepSpeed?: number;
  secret?: string;
  /** Skip the awake fade; used by the stage stills. */
  instant?: boolean;
  /** Stage peek parks the beam on the left-center of the field. */
  park?: "peek" | "search" | null;
  editable?: boolean;
  locked?: boolean;
  showHint?: boolean;
  showLabel?: boolean;
  onSecretChange?: (next: string) => void;
  onAwakeChange?: (awake: boolean) => void;
};

function SleepingEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 13.2c3.8-4.2 13.2-4.2 17 0"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path d="M6.6 10.1 5.4 7.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M12 9.2V6.6" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M17.4 10.1 18.6 7.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function OpenEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 12s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

function readCssColor(el: HTMLElement, name: string, fallback: string): string {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

function drawBeam(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  origin: Point,
  angle: number,
  halfAngle: number,
  awakeT: number,
  veil: string,
  glow: string,
) {
  ctx.clearRect(0, 0, w, h);
  if (awakeT < 0.01) return;

  ctx.fillStyle = veil;
  ctx.globalAlpha = 0.78 * awakeT;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  const length = Math.hypot(w, h) * 1.28;
  const farW = Math.tan(halfAngle) * length;

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.translate(origin.x, origin.y);
  ctx.rotate(angle);
  ctx.filter = "blur(10px)";
  const punch = ctx.createLinearGradient(0, 0, length, 0);
  punch.addColorStop(0, `rgba(255,255,255,${awakeT})`);
  punch.addColorStop(0.58, `rgba(255,255,255,${0.78 * awakeT})`);
  punch.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(length, -farW);
  ctx.lineTo(length, farW);
  ctx.closePath();
  ctx.fillStyle = punch;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(origin.x, origin.y);
  ctx.rotate(angle);
  ctx.filter = "blur(18px)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, -farW * 1.08);
  ctx.lineTo(length, farW * 1.08);
  ctx.closePath();
  const haze = ctx.createLinearGradient(0, 0, length, 0);
  haze.addColorStop(0, glow);
  haze.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.55 * awakeT;
  ctx.fillStyle = haze;
  ctx.fill();
  ctx.restore();
}

function sizeCanvas(canvas: HTMLCanvasElement, host: HTMLElement): { w: number; h: number } {
  const rect = host.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  const bw = Math.floor(w * dpr);
  const bh = Math.floor(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return { w, h };
}

function glyphCenters(root: HTMLElement | null): Point[] {
  if (!root) return [];
  const nodes = root.querySelectorAll("[data-glyph]");
  const out: Point[] = [];
  nodes.forEach((node) => {
    const box = node.getBoundingClientRect();
    out.push({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  });
  return out;
}

export function ConeField({
  kind,
  awake,
  beamWidth = DEFAULT_BEAM_WIDTH,
  followPointer = true,
  autoSearch = true,
  sweepSpeed = DEFAULT_SWEEP_SPEED,
  secret = DEMO_SECRET,
  instant = false,
  park = null,
  editable = false,
  locked = false,
  showHint = true,
  showLabel = true,
  onSecretChange,
  onAwakeChange,
}: ConeFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eyeRef = useRef<HTMLButtonElement>(null);
  const glyphsRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    Array.from({ length: secret.length }, () => false),
  );
  const [isCoarse, setIsCoarse] = useState(false);

  const awakeRef = useRef(awake);
  const kindRef = useRef(kind);
  const beamRef = useRef(beamWidth);
  const followRef = useRef(followPointer);
  const searchRef = useRef(autoSearch);
  const speedRef = useRef(sweepSpeed);
  const parkRef = useRef(park);
  const instantRef = useRef(instant);
  const revealedRef = useRef(revealed);
  const pointerRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    awakeRef.current = awake;
  }, [awake]);
  useEffect(() => {
    kindRef.current = kind;
  }, [kind]);
  useEffect(() => {
    beamRef.current = beamWidth;
  }, [beamWidth]);
  useEffect(() => {
    followRef.current = followPointer;
  }, [followPointer]);
  useEffect(() => {
    searchRef.current = autoSearch;
  }, [autoSearch]);
  useEffect(() => {
    speedRef.current = sweepSpeed;
  }, [sweepSpeed]);
  useEffect(() => {
    parkRef.current = park;
  }, [park]);
  useEffect(() => {
    instantRef.current = instant;
  }, [instant]);
  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  useEffect(() => {
    setRevealed(Array.from({ length: secret.length }, () => false));
  }, [secret, kind]);

  useEffect(() => {
    setIsCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let angle = PARK_ANGLE;
    let awakeT = instantRef.current && awakeRef.current ? 1 : 0;
    let searchT = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w, h } = sizeCanvas(canvas, host);
      const isAwake = awakeRef.current;
      const k = kindRef.current;
      const half = beamHalfAngle(beamRef.current);
      const veil = readCssColor(host, "--cone-veil", "rgb(23 24 28 / 0.52)");
      const glow = readCssColor(host, "--cone-glow", "rgb(59 108 255 / 0.42)");

      const targetAwake = isAwake ? 1 : 0;
      if (instantRef.current) awakeT = targetAwake;
      else awakeT += (targetAwake - awakeT) * Math.min(1, dt * AWAKE_SPEED);

      const eye = eyeRef.current;
      const origin: Point = { x: w - 52, y: h * 0.38 };
      if (eye) {
        const r = eye.getBoundingClientRect();
        const hr = host.getBoundingClientRect();
        origin.x = r.left + r.width * 0.5 - hr.left;
        origin.y = r.top + r.height * (isAwake ? 0.12 : 0.5) - hr.top;
      }

      const hr = host.getBoundingClientRect();
      const originAbs: Point = { x: hr.left + origin.x, y: hr.top + origin.y };

      const glyphsAbs = glyphCenters(glyphsRef.current);
      const pointer = pointerRef.current;
      const parkMode = parkRef.current;
      const recentlyMoved = pointer.t > 0 && now - pointer.t < POINTER_HOLD_MS;

      const box = glyphsRef.current?.getBoundingClientRect();
      const field = box
        ? { left: box.left, top: box.top, width: box.width, height: box.height }
        : null;
      const restAt = field ? (parkMode === "peek" ? peekAim(field) : fieldAim(field)) : null;
      const rest = restAt ? angleTo(originAbs, restAt) : PARK_ANGLE;

      let target = rest;
      if (k === "cone" && isAwake) {
        if (parkMode === "peek") {
          target = rest;
        } else if (parkMode === "search") {
          searchT += dt;
          target = rest + (searchAngle(searchT, speedRef.current) - PARK_ANGLE);
        } else if (followRef.current && recentlyMoved) {
          target = angleTo(originAbs, pointer);
        } else if (searchRef.current) {
          searchT += dt;
          target = rest + (searchAngle(searchT, speedRef.current) - PARK_ANGLE);
        }
      }

      if (instantRef.current && k === "cone" && isAwake && parkMode !== "search") {
        angle = target;
      }

      const follow = k === "cone" && isAwake && followRef.current && recentlyMoved && parkMode !== "peek";
      const smooth = follow ? 11 : 3.2;
      angle = lerpAngle(angle, target, 1 - Math.exp(-smooth * dt));

      if (k === "cone") {
        drawBeam(ctx, w, h, origin, angle, half, awakeT, veil, glow);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      let next: boolean[];
      if (k === "toggle") {
        next = toggleReveal(glyphsAbs.length || secret.length, isAwake);
      } else if (k === "nearest") {
        next = Array.from({ length: glyphsAbs.length || secret.length }, () => false);
        if (isAwake && glyphsAbs.length) {
          const box = glyphsRef.current?.getBoundingClientRect();
          const aim = recentlyMoved
            ? pointer
            : box
              ? fieldAim({ left: box.left, top: box.top, width: box.width, height: box.height }, 0.22)
              : glyphsAbs[0]!;
          const idx = nearestIndex(glyphsAbs, aim);
          if (idx >= 0) next[idx] = true;
        }
      } else if (awakeT > 0.18) {
        const maxDist = Math.hypot(w, h);
        next = revealGlyphs(glyphsAbs, originAbs, angle, half, maxDist);
      } else {
        next = Array.from({ length: glyphsAbs.length || secret.length }, () => false);
      }

      if (!sameReveal(next, revealedRef.current)) {
        revealedRef.current = next;
        setRevealed(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [secret]);

  const toggle = useCallback(() => {
    if (locked) return;
    onAwakeChange?.(!awake);
  }, [awake, locked, onAwakeChange]);

  const chars = useMemo(() => Array.from(secret), [secret]);

  const hint = !awake
    ? isCoarse
      ? "点按右侧灯座，唤醒锥光。"
      : "点击右侧灯座，唤醒锥光。"
    : kind === "toggle"
      ? "整段已经是明文。肩窥一次看完。"
      : kind === "nearest"
        ? "只有离指针最近的一格是字。扫过去会闪。"
        : isCoarse
          ? "在页面上拖动瞄准。灯座抬在基线之上，锥才能切开这一行。"
          : "在页面上移动指针瞄准。灯座抬在基线之上，锥才能切开这一行。";

  return (
    <div className="flex flex-col gap-3">
      {showHint ? (
        <p className="text-center text-[13px] leading-relaxed text-fg-muted">{hint}</p>
      ) : null}

      {showLabel ? (
        <span className="pl-1 text-[12px] text-fg-subtle">密文</span>
      ) : null}

      <div
        ref={hostRef}
        className="cone-field relative overflow-visible rounded-2xl border border-border bg-surface shadow-card"
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-h-[22rem] flex-col items-center justify-center px-5 py-12 pr-16 sm:px-10 sm:pr-20">
          <div className="relative mx-auto w-fit min-w-[16rem] max-w-full">
            <div
              className={`relative rounded-full border bg-bg/70 transition-[border-color,box-shadow] duration-300 ${
                awake ? "border-accent shadow-[0_0_0_3px_var(--color-ring)]" : "border-border-strong"
              }`}
            >
              <div
                ref={glyphsRef}
                className="pointer-events-none relative flex h-14 items-center px-5 pr-16 font-mono text-[17px] tracking-[0.18em] text-fg sm:pr-20"
                aria-hidden="true"
              >
                {chars.length === 0 ? (
                  <span className="tracking-normal text-fg-subtle">输入一段密文</span>
                ) : (
                  chars.map((ch, i) => (
                    <span key={`${i}-${ch}`} data-glyph className="inline-block">
                      {ch === " " ? "\u00a0" : revealed[i] ? ch : BULLET}
                    </span>
                  ))
                )}
              </div>

              {editable ? (
                <input
                  type="text"
                  name="secret"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="密文"
                  value={secret}
                  onChange={(e) => onSecretChange?.(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full rounded-full bg-transparent px-5 pr-16 font-mono text-[17px] tracking-[0.18em] text-transparent caret-fg outline-none sm:pr-20"
                />
              ) : (
                <span className="sr-only">{awake ? secret : "hidden secret"}</span>
              )}

              <button
                ref={eyeRef}
                type="button"
                onClick={toggle}
                disabled={locked}
                aria-pressed={awake}
                aria-label={awake ? "关闭锥光" : "唤醒锥光"}
                className={`absolute z-30 flex items-center justify-center text-fg transition-[width,height,right,top,transform,color] duration-300 ${
                  awake
                    ? "top-1/2 right-[-1.15rem] h-20 w-20 -translate-y-[58%] text-accent sm:right-[-1.35rem] sm:h-24 sm:w-24"
                    : "top-1/2 right-1.5 size-11 -translate-y-1/2 text-fg-muted hover:text-fg"
                } ${locked ? "cursor-default" : ""}`}
              >
                {awake ? <OpenEye className="size-8 sm:size-10" /> : <SleepingEye className="size-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
