import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEMO_MAX,
  DEMO_MIN,
  DEMO_STEP,
  DEMO_VALUE,
  SLING_GRAVITY,
  SLING_THRESHOLD,
  clamp,
  dragMode,
  flightSpeed,
  formatDemo,
  predictThrow,
  projectileAt,
  quantize,
  valueFromX,
  xFromValue,
  type DragMode,
  type SlingKind,
  type ThrowPrediction,
  type Vec,
} from "./lib/machines";
import "./sling-throw.css";

type TrackGeom = { minX: number; maxX: number; y: number };

type DragState = {
  pointerId: number;
  mode: DragMode;
  anchor: Vec;
  ball: Vec;
  predicted: number;
  throw: ThrowPrediction | null;
  /** Off-track pointer shown in clamp mode so the discarded Y is visible. */
  ghost: Vec | null;
};

type FlightState = {
  origin: Vec;
  velocity: Vec;
  tHit: number;
  landing: Vec;
  landingValue: number;
  startedAt: number;
  samples: Vec[];
};

export type SlingTrackProps = {
  kind: SlingKind;
  value?: number;
  onChange?: (value: number) => void;
  locked?: boolean;
  lockState?: "idle" | "pull";
  showHint?: boolean;
};

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toLocal(host: DOMRect, p: Vec): Vec {
  return { x: p.x - host.left, y: p.y - host.top };
}

export function SlingTrack({
  kind,
  value = DEMO_VALUE,
  onChange,
  locked = false,
  lockState = "idle",
  showHint = true,
}: SlingTrackProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const geomRef = useRef<TrackGeom | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const flightRef = useRef<FlightState | null>(null);
  const kindRef = useRef(kind);
  const valueRef = useRef(value);
  const rafMove = useRef(0);
  const rafFlight = useRef(0);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [flight, setFlight] = useState<FlightState | null>(null);
  const [flightPos, setFlightPos] = useState<Vec | null>(null);
  const [hostBox, setHostBox] = useState({ w: 640, h: 360 });
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    kindRef.current = kind;
  }, [kind]);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const host = hostRef.current;
    if (!track || !host) return;
    const r = track.getBoundingClientRect();
    geomRef.current = { minX: r.left, maxX: r.right, y: r.top + r.height / 2 };
    const h = host.getBoundingClientRect();
    setHostBox({ w: Math.max(1, Math.round(h.width)), h: Math.max(1, Math.round(h.height)) });
  }, []);

  const commit = useCallback(
    (raw: number) => {
      const next = quantize(raw, DEMO_MIN, DEMO_MAX, DEMO_STEP);
      onChange?.(next);
      setLanded(true);
      window.setTimeout(() => setLanded(false), 420);
    },
    [onChange],
  );

  const finishFlight = useCallback(
    (f: FlightState) => {
      commit(f.landingValue);
      setFlight(null);
      setFlightPos(null);
      flightRef.current = null;
    },
    [commit],
  );

  const tickFlight = useCallback(() => {
    const f = flightRef.current;
    if (!f) return;
    const elapsed = (performance.now() - f.startedAt) / 1000;
    const speed = flightSpeed(f.tHit);
    const t = Math.min(elapsed * speed, f.tHit);
    if (t >= f.tHit) {
      setFlightPos(f.landing);
      cancelAnimationFrame(rafFlight.current);
      rafFlight.current = 0;
      finishFlight(f);
      return;
    }
    setFlightPos(projectileAt(f.origin, f.velocity, SLING_GRAVITY, t));
    rafFlight.current = requestAnimationFrame(tickFlight);
  }, [finishFlight]);

  const applyPointer = useCallback((clientX: number, clientY: number) => {
    const d = dragRef.current;
    const geom = geomRef.current;
    if (!d || !geom) return;
    const ball = { x: clientX, y: clientY };
    const off = clientY - geom.y;
    const onTrackX = clamp(clientX, geom.minX, geom.maxX);
    const mode: DragMode =
      kindRef.current === "clamp" ? "slide" : dragMode(off, SLING_THRESHOLD);

    if (mode === "slide") {
      const v = valueFromX(onTrackX, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX);
      const onTrack = { x: onTrackX, y: geom.y };
      const next: DragState = {
        ...d,
        mode: "slide",
        anchor: onTrack,
        ball: onTrack,
        predicted: quantize(v, DEMO_MIN, DEMO_MAX, DEMO_STEP),
        throw: null,
        ghost: kindRef.current === "clamp" && Math.abs(off) >= SLING_THRESHOLD ? ball : null,
      };
      dragRef.current = next;
      setDrag(next);
      return;
    }

    const prediction = predictThrow({
      origin: ball,
      anchor: d.anchor,
      trackY: geom.y,
      trackMinX: geom.minX,
      trackMaxX: geom.maxX,
    });
    const predicted = prediction
      ? quantize(
          valueFromX(prediction.landing.x, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX),
          DEMO_MIN,
          DEMO_MAX,
          DEMO_STEP,
        )
      : quantize(
          valueFromX(onTrackX, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX),
          DEMO_MIN,
          DEMO_MAX,
          DEMO_STEP,
        );
    const next: DragState = { ...d, mode: "sling", ball, predicted, throw: prediction, ghost: null };
    dragRef.current = next;
    setDrag(next);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current || e.pointerId !== dragRef.current.pointerId) return;
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      if (rafMove.current) cancelAnimationFrame(rafMove.current);
      rafMove.current = requestAnimationFrame(() => {
        rafMove.current = 0;
        applyPointer(x, y);
      });
    },
    [applyPointer],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      const pred = d.throw;
      if (d.mode === "sling" && pred && !reducedMotion()) {
        const f: FlightState = {
          origin: d.ball,
          velocity: pred.velocity,
          tHit: pred.tHit,
          landing: pred.landing,
          landingValue: d.predicted,
          startedAt: performance.now(),
          samples: pred.samples,
        };
        dragRef.current = null;
        setDrag(null);
        flightRef.current = f;
        setFlight(f);
        setFlightPos(d.ball);
        rafFlight.current = requestAnimationFrame(tickFlight);
      } else {
        commit(d.predicted);
        dragRef.current = null;
        setDrag(null);
      }
    },
    [commit, onPointerMove, tickFlight],
  );

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (locked || flightRef.current) return;
      if (e.button !== 0) return;
      e.preventDefault();
      measure();
      const geom = geomRef.current;
      if (!geom) return;
      const thumbX = xFromValue(valueRef.current, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX);
      const grabbingThumb =
        Math.abs(e.clientX - thumbX) < 20 && Math.abs(e.clientY - geom.y) < 22;
      const startX = grabbingThumb ? thumbX : clamp(e.clientX, geom.minX, geom.maxX);
      const originValue = grabbingThumb
        ? valueRef.current
        : quantize(valueFromX(startX, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX), DEMO_MIN, DEMO_MAX, DEMO_STEP);
      const next: DragState = {
        pointerId: e.pointerId,
        mode: "slide",
        anchor: { x: startX, y: geom.y },
        ball: { x: startX, y: geom.y },
        predicted: originValue,
        throw: null,
        ghost: null,
      };
      dragRef.current = next;
      setDrag(next);
      setLanded(false);
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [locked, measure, onPointerMove, onPointerUp],
  );

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (rafMove.current) cancelAnimationFrame(rafMove.current);
      if (rafFlight.current) cancelAnimationFrame(rafFlight.current);
    };
  }, [measure, onPointerMove, onPointerUp]);

  useEffect(() => {
    if (!locked) return;
    measure();
    const geom = geomRef.current;
    if (!geom) return;
    if (lockState !== "pull") {
      dragRef.current = null;
      setDrag(null);
      return;
    }
    const thumbX = xFromValue(value, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX);
    const pointer = { x: thumbX - 52, y: geom.y + 92 };
    const onTrack = { x: clamp(pointer.x, geom.minX, geom.maxX), y: geom.y };
    if (kind !== "sling") {
      const v = valueFromX(onTrack.x, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX);
      const next: DragState = {
        pointerId: -1,
        mode: "slide",
        anchor: onTrack,
        ball: onTrack,
        predicted: quantize(v, DEMO_MIN, DEMO_MAX, DEMO_STEP),
        throw: null,
        ghost: pointer,
      };
      dragRef.current = next;
      setDrag(next);
      return;
    }
    const prediction = predictThrow({
      origin: pointer,
      anchor: { x: thumbX, y: geom.y },
      trackY: geom.y,
      trackMinX: geom.minX,
      trackMaxX: geom.maxX,
    });
    const predicted = prediction
      ? quantize(
          valueFromX(prediction.landing.x, geom.minX, geom.maxX, DEMO_MIN, DEMO_MAX),
          DEMO_MIN,
          DEMO_MAX,
          DEMO_STEP,
        )
      : value;
    const next: DragState = {
      pointerId: -1,
      mode: "sling",
      anchor: { x: thumbX, y: geom.y },
      ball: pointer,
      predicted,
      throw: prediction,
      ghost: null,
    };
    dragRef.current = next;
    setDrag(next);
  }, [kind, lockState, locked, measure, value]);

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (locked) return;
      const step = e.shiftKey ? DEMO_STEP * 10 : DEMO_STEP;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        commit(value - step);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        commit(value + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        commit(DEMO_MIN);
      } else if (e.key === "End") {
        e.preventDefault();
        commit(DEMO_MAX);
      }
    },
    [commit, locked, value],
  );

  const shown =
    drag ? drag.predicted : flight ? flight.landingValue : value;
  const t = clamp((shown - DEMO_MIN) / (DEMO_MAX - DEMO_MIN), 0, 1);
  const active = Boolean(drag || flight);
  const sling = Boolean((drag && drag.mode === "sling") || flight);
  const hostRect = hostRef.current?.getBoundingClientRect();

  const overlayBall = flight && flightPos ? flightPos : drag?.ball ?? null;
  const samples = flight?.samples ?? drag?.throw?.samples ?? [];
  const bands =
    drag?.mode === "sling" && drag.throw
      ? { a: drag.throw.forkA, b: drag.throw.forkB, ball: drag.ball }
      : null;
  const tick =
    drag?.mode === "sling" && drag.throw
      ? { x: drag.throw.landing.x, y: drag.throw.landing.y, text: formatDemo(drag.predicted) }
      : flight
        ? { x: flight.landing.x, y: flight.landing.y, text: formatDemo(flight.landingValue) }
        : null;

  const hint =
    kind === "clamp"
      ? "离轨仍夹回轨道。Y 被丢掉，只能沿 X 蹭。"
      : "沿轨道拖是一维调值。竖向离开超过 14px，松手按落点改值。";

  return (
    <div className="flex flex-col gap-3">
      {showHint ? (
        <p className="text-center text-[13px] leading-relaxed text-fg-muted">{hint}</p>
      ) : null}

      <div
        ref={hostRef}
        className="sling-track relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
      >
        <div className="relative z-10 flex min-h-[22rem] flex-col justify-center px-8 py-12 sm:px-12">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="text-[13px] text-fg-muted">数值</span>
            <span
              className={`font-mono text-[15px] tabular-nums ${
                sling || landed ? "text-accent" : "text-fg"
              }`}
            >
              {formatDemo(shown)}
            </span>
          </div>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={locked ? -1 : 0}
            aria-valuemin={DEMO_MIN}
            aria-valuemax={DEMO_MAX}
            aria-valuenow={shown}
            aria-valuetext={formatDemo(shown)}
            aria-label="数值"
            aria-disabled={locked}
            className={`relative h-11 touch-none outline-none ${locked ? "cursor-default" : "cursor-grab"} ${
              active && !locked ? "cursor-grabbing" : ""
            }`}
            style={{ touchAction: "none" }}
            onPointerDown={startDrag}
            onKeyDown={onKey}
          >
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border-strong" />
            <div
              className="pointer-events-none absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-fg transition-opacity duration-150"
              style={{ width: `${t * 100}%`, opacity: active ? 0 : 1 }}
            />
            {!active && (
              <div
                className={`pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg ${
                  landed ? "ring-2 ring-accent" : ""
                }`}
                style={{ left: `${t * 100}%` }}
              />
            )}
          </div>
        </div>

        {overlayBall && hostRect && (
          <svg
            className="pointer-events-none absolute inset-0 z-20"
            width={hostBox.w}
            height={hostBox.h}
            viewBox={`0 0 ${hostBox.w} ${hostBox.h}`}
            aria-hidden
          >
            {bands && (
              <g stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" fill="none">
                <line
                  x1={toLocal(hostRect, bands.a).x}
                  y1={toLocal(hostRect, bands.a).y}
                  x2={toLocal(hostRect, bands.ball).x}
                  y2={toLocal(hostRect, bands.ball).y}
                />
                <line
                  x1={toLocal(hostRect, bands.b).x}
                  y1={toLocal(hostRect, bands.b).y}
                  x2={toLocal(hostRect, bands.ball).x}
                  y2={toLocal(hostRect, bands.ball).y}
                />
                <circle cx={toLocal(hostRect, bands.a).x} cy={toLocal(hostRect, bands.a).y} r="2.2" fill="var(--color-accent)" />
                <circle cx={toLocal(hostRect, bands.b).x} cy={toLocal(hostRect, bands.b).y} r="2.2" fill="var(--color-accent)" />
              </g>
            )}
            {samples.map((p, i) => {
              const loc = toLocal(hostRect, p);
              return (
                <circle
                  key={i}
                  cx={loc.x}
                  cy={loc.y}
                  r={1.9}
                  fill="var(--color-fg-muted)"
                  opacity={0.4 + (i / Math.max(1, samples.length)) * 0.5}
                />
              );
            })}
            {tick && (
              <g>
                <line
                  x1={toLocal(hostRect, tick).x}
                  y1={toLocal(hostRect, tick).y - 7}
                  x2={toLocal(hostRect, tick).x}
                  y2={toLocal(hostRect, tick).y + 7}
                  stroke="var(--color-accent)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <text
                  x={toLocal(hostRect, tick).x}
                  y={toLocal(hostRect, tick).y - 14}
                  textAnchor="middle"
                  fill="var(--color-accent)"
                  fontSize="13"
                  fontFamily="var(--font-mono)"
                >
                  {tick.text}
                </text>
              </g>
            )}
            {drag?.ghost && (
              <circle
                cx={toLocal(hostRect, drag.ghost).x}
                cy={toLocal(hostRect, drag.ghost).y}
                r={6}
                fill="var(--color-fg-muted)"
                opacity={0.45}
              />
            )}
            <circle
              cx={toLocal(hostRect, overlayBall).x}
              cy={toLocal(hostRect, overlayBall).y}
              r={bands || flight ? 8 : 6}
              fill="var(--color-accent)"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
