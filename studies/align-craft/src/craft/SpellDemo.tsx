import { LayoutGrid, Play } from "lucide-react";
import {
  GEOMETRIC_POSITION,
  SUBJECT_POSITION,
  needsObjectPosition,
  objectFitFor,
  objectPositionFor,
  type KindId,
  type StageState,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";

const SUBJECT_ART = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 400">
  <rect width="240" height="400" fill="#d5dee8"/>
  <circle cx="72" cy="70" r="28" fill="#f3e6c8"/>
  <rect x="18" y="48" width="22" height="214" rx="3" fill="#8d97a6"/>
  <rect x="72" y="36" width="24" height="226" rx="3" fill="#7b8696"/>
  <rect x="130" y="56" width="22" height="206" rx="3" fill="#8d97a6"/>
  <rect x="184" y="42" width="24" height="220" rx="3" fill="#6f7a8a"/>
  <rect x="0" y="258" width="240" height="142" fill="#cbb89a"/>
  <ellipse cx="120" cy="268" rx="130" ry="22" fill="#b9a484"/>
  <g transform="translate(120 352)">
    <circle cy="-28" r="9" fill="#17181c"/>
    <rect x="-7" y="-18" width="14" height="22" rx="4" fill="#17181c"/>
    <rect x="-9" y="4" width="6" height="18" rx="2" fill="#17181c"/>
    <rect x="3" y="4" width="6" height="16" rx="2" fill="#17181c"/>
    <rect x="-18" y="-12" width="10" height="5" rx="2" fill="#17181c"/>
    <rect x="8" y="-12" width="10" height="5" rx="2" fill="#17181c"/>
  </g>
</svg>`)}`;

export function SpellFigure({ id, state }: { id: KindId; state: StageState }) {
  switch (id) {
    case "baseline":
      return <BaselineFigure state={state} />;
    case "cover":
      return <CoverFigure state={state} />;
    case "axis":
      return <AxisFigure state={state} />;
    case "margin":
      return <MarginFigure state={state} />;
    case "padding":
      return <PaddingFigure state={state} />;
    case "optical":
      return <OpticalFigure state={state} />;
    case "inset":
      return <InsetFigure state={state} />;
  }
}

function BaselineFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className={cn("relative flex gap-2", right ? "items-baseline" : "items-center")}>
      {!right ? <span aria-hidden className="align-box-guide" /> : null}
      <span className="relative text-[4.5rem] font-semibold leading-none tracking-tight text-fg">
        128
        {right ? <span aria-hidden className="align-baseline-guide" /> : null}
      </span>
      <span className="text-[1.25rem] leading-none text-accent">
        {locale === "en" ? "/mo" : "元/月"}
      </span>
    </div>
  );
}

function CoverFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div
      className={cn(
        "relative aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border border-border",
        right ? "bg-fg/5" : "align-hatch",
      )}
    >
      <img
        src={SUBJECT_ART}
        alt={pick({ zh: "廊柱下的行人", en: "A walker under the colonnade" }, locale)}
        className="size-full"
        style={{
          objectFit: right ? objectFitFor("cover") : "contain",
          objectPosition: objectPositionFor("cover", state),
        }}
      />
      {right && needsObjectPosition("cover") ? (
        <span aria-hidden className="align-focus-mark" title={SUBJECT_POSITION} />
      ) : null}
      {!right ? (
        <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-accent">
          contain · {GEOMETRIC_POSITION}
        </span>
      ) : (
        <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-intent">
          cover · {SUBJECT_POSITION}
        </span>
      )}
    </div>
  );
}

function AxisFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className={cn("flex gap-3", right ? "items-center" : "items-start")}>
      <span className={cn("grid size-10 place-items-center rounded-lg bg-accent text-accent-fg", !right && "mt-1")}>
        <LayoutGrid className="size-5" />
      </span>
      <span className="text-[15px] font-medium">
        {pick({ zh: "图标与文字对齐", en: "Icon and label" }, locale)}
      </span>
    </div>
  );
}

function MarginFigure({ state }: { state: StageState }) {
  const right = state === "right";
  if (right) {
    return (
      <div className="flex w-full max-w-[220px] flex-col gap-4">
        <div className="h-14 rounded-lg bg-surface-2" />
        <div className="h-14 rounded-lg bg-surface-2" />
        <div className="h-14 rounded-lg bg-surface-2" />
      </div>
    );
  }
  return (
    <div className="w-full max-w-[220px]">
      <div className="h-14 rounded-lg bg-surface-2" />
      <div className="align-hatch-accent relative my-[18px] flex h-8 items-center justify-center">
        <span className="text-[11px] font-medium tracking-wide text-accent">margin 18px</span>
      </div>
      <div className="h-14 rounded-lg bg-surface-2" />
      <div className="mt-[7px] h-14 rounded-lg bg-surface-2" />
    </div>
  );
}

function PaddingFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-bg">
      <div className={cn("relative min-h-40", right ? "align-pad-right" : "px-4 pb-6 pt-1")}>
        {right ? <span aria-hidden className="align-cap-guide" /> : null}
        <p className="text-[1.65rem] font-semibold leading-[1.15] tracking-tight">
          {pick({ zh: "关于我们", en: "About us" }, locale)}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          {pick(
            { zh: "第一行不再贴着顶边。", en: "The first line is no longer flush to the top." },
            locale,
          )}
        </p>
      </div>
    </div>
  );
}

function OpticalFigure({ state }: { state: StageState }) {
  const right = state === "right";
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-14 place-items-center rounded-lg bg-surface-2">
        <span className={cn("size-8 rounded-full bg-fg", right && "align-optical-circle")} />
      </span>
      <span className="grid size-14 place-items-center rounded-lg bg-surface-2">
        <span className="size-8 bg-fg" />
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-fg text-surface">
        <Play className={cn("size-5", right && "align-optical-play")} fill="currentColor" stroke="none" />
      </span>
    </div>
  );
}

function InsetFigure({ state }: { state: StageState }) {
  const right = state === "right";
  return (
    <div className="relative h-36 w-64 overflow-hidden rounded-2xl bg-accent/80">
      <div
        className={cn(
          "flex flex-col justify-center gap-2 rounded-xl bg-fg/75 px-4 py-3",
          right ? "absolute inset-[10px]" : "align-inset-guess",
        )}
      >
        <span className="h-2 w-20 rounded-full bg-surface/85" />
        <span className="h-2 w-36 rounded-full bg-surface/50" />
      </div>
    </div>
  );
}
