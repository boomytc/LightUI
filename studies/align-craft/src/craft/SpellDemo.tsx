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
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c5d4e4"/>
      <stop offset="1" stop-color="#e4d8c4"/>
    </linearGradient>
  </defs>
  <rect width="240" height="400" fill="url(#sky)"/>
  <circle cx="186" cy="54" r="18" fill="#f4e4b8"/>
  <rect x="18" y="48" width="22" height="214" rx="3" fill="#7f8a99"/>
  <rect x="72" y="36" width="24" height="226" rx="3" fill="#6d7888"/>
  <rect x="130" y="56" width="22" height="206" rx="3" fill="#7f8a99"/>
  <rect x="184" y="42" width="24" height="220" rx="3" fill="#5f6a7a"/>
  <rect x="0" y="258" width="240" height="142" fill="#c4ae8a"/>
  <ellipse cx="120" cy="268" rx="130" ry="22" fill="#b39a76"/>
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
    <div className="w-full min-w-0">
      <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase">
        {pick({ zh: "专业版 · 按月", en: "Pro · monthly" }, locale)}
      </p>
      <div
        className={cn(
          "relative flex w-full min-w-0 gap-[0.35em] text-[3.25rem] font-semibold leading-none tracking-tight text-fg sm:text-[4.5rem]",
          right ? "items-baseline" : "items-center",
        )}
      >
        {!right ? <span aria-hidden className="align-box-guide" /> : null}
        {right ? <span aria-hidden className="align-baseline-guide" /> : null}
        <span className="shrink-0">128</span>
        <span className="text-[0.28em] font-normal leading-none text-accent">
          {locale === "en" ? "/mo" : "元/月"}
        </span>
      </div>
    </div>
  );
}

function CoverFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-xl border border-border",
        right ? "bg-fg/5" : "align-hatch",
      )}
    >
      <img
        src={SUBJECT_ART}
        alt={pick({ zh: "廊柱下的行人", en: "A walker under the colonnade" }, locale)}
        className="absolute inset-0 size-full"
        style={{
          objectFit: right ? objectFitFor("cover") : "contain",
          objectPosition: objectPositionFor("cover", state),
        }}
      />
      {right && needsObjectPosition("cover") ? (
        <span aria-hidden className="align-focus-mark" title={SUBJECT_POSITION} />
      ) : (
        <span aria-hidden className="align-center-mark" title={GEOMETRIC_POSITION} />
      )}
      <span
        className={cn(
          "pointer-events-none absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium",
          right ? "bg-intent text-white" : "bg-wrong text-white",
        )}
      >
        {right ? `cover · ${SUBJECT_POSITION}` : `contain · ${GEOMETRIC_POSITION}`}
      </span>
    </div>
  );
}

function AxisFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 gap-3 rounded-xl border border-border bg-bg px-4 py-4 sm:px-5 sm:py-5",
        right ? "items-center" : "items-start",
      )}
    >
      <span aria-hidden className={right ? "align-mid-guide" : "align-top-guide"} />
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg">
        <LayoutGrid className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">
          {pick({ zh: "图标与文字对齐", en: "Icon and label" }, locale)}
        </span>
        <span className="mt-0.5 block text-[12px] leading-5 text-fg-muted">
          {pick(
            right
              ? { zh: "交叉轴居中，中线重合。", en: "Cross-axis center; midlines meet." }
              : { zh: "没写交叉轴，图标贴着第一行顶。", en: "No cross axis; the icon hugs the first line." },
            locale,
          )}
        </span>
      </span>
    </div>
  );
}

const STACK = [
  { zh: "封面裁切", en: "Cover crop" },
  { zh: "价格基线", en: "Price lockup" },
  { zh: "图标行", en: "Icon row" },
];

function MarginFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  if (right) {
    return (
      <div className="align-gap-stack flex w-full min-w-0 flex-col gap-4">
        {STACK.map((item, i) => (
          <StackCard key={item.zh} index={i} label={pick(item, locale)} />
        ))}
      </div>
    );
  }
  return (
    <div className="w-full min-w-0">
      <StackCard index={0} label={pick(STACK[0]!, locale)} />
      <div className="align-hatch-accent relative my-[18px] flex h-8 items-center justify-center">
        <span className="rounded-full bg-wrong-soft px-2 py-0.5 font-mono text-[10px] font-medium text-wrong">
          margin 18px
        </span>
      </div>
      <StackCard index={1} label={pick(STACK[1]!, locale)} />
      <div className="mt-[7px] flex items-center justify-center">
        <span className="-mb-2 rounded-full bg-wrong-soft px-2 py-0.5 font-mono text-[10px] font-medium text-wrong">
          margin 7px
        </span>
      </div>
      <StackCard index={2} label={pick(STACK[2]!, locale)} />
    </div>
  );
}

function StackCard({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex h-16 items-center justify-between rounded-lg bg-surface-2 px-3 sm:h-[4.5rem] sm:px-4">
      <span className="text-[13px] font-medium">{label}</span>
      <span className="font-mono text-[10px] tabular-nums text-fg-subtle">0{index + 1}</span>
    </div>
  );
}

function PaddingFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="relative w-full min-w-0 overflow-hidden rounded-xl border border-border bg-bg">
      <div className={cn("relative min-h-44 sm:min-h-52", right ? "align-pad-right" : "px-4 pb-6 pt-1")}>
        {right ? <span aria-hidden className="align-cap-guide" /> : (
          <span aria-hidden className="align-flush-guide" />
        )}
        <p className="text-[1.65rem] font-semibold leading-[1.15] tracking-tight">
          {pick({ zh: "关于我们", en: "About us" }, locale)}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          {pick(
            right
              ? { zh: "帽高对上左右 inset，第一行不再贴顶。", en: "The cap meets the inset. The first line is no longer flush." }
              : { zh: "padding 从内容盒顶起算，第一行贴着盒子顶。", en: "Padding starts at the content-box. The first line is flush." },
            locale,
          )}
        </p>
      </div>
    </div>
  );
}

function OpticalFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="flex w-full min-w-0 items-center justify-evenly gap-3 rounded-2xl bg-surface-2 px-2 pb-10 pt-6 sm:px-4 sm:pb-12 sm:pt-8">
      <span className="relative grid size-14 place-items-center rounded-xl bg-surface sm:size-16">
        <span aria-hidden className="align-geo-cross" />
        <span className={cn("size-8 rounded-full bg-fg sm:size-9", right && "align-optical-circle")} />
        <span className="absolute -bottom-5 font-mono text-[9px] text-fg-subtle">
          {right ? pick({ zh: "圆略大", en: "scaled" }, locale) : pick({ zh: "同盒", en: "same box" }, locale)}
        </span>
      </span>
      <span className="relative grid size-14 place-items-center rounded-xl bg-surface sm:size-16">
        <span aria-hidden className="align-geo-cross" />
        <span className="size-8 bg-fg sm:size-9" />
        <span className="absolute -bottom-5 font-mono text-[9px] text-fg-subtle">
          {pick({ zh: "方", en: "square" }, locale)}
        </span>
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-fg text-surface sm:size-16">
        <span aria-hidden className="align-geo-cross align-geo-cross-on-dark" />
        <Play className={cn("size-5 sm:size-6", right && "align-optical-play")} fill="currentColor" stroke="none" />
        <span className="absolute -bottom-5 font-mono text-[9px] text-fg-subtle">
          {right ? pick({ zh: "略右", en: "nudged" }, locale) : pick({ zh: "正中", en: "centered" }, locale)}
        </span>
      </span>
    </div>
  );
}

function InsetFigure({ state }: { state: StageState }) {
  const right = state === "right";
  return (
    <div className="relative aspect-[16/10] w-full min-w-0 overflow-hidden rounded-2xl bg-accent/80">
      {right ? <span aria-hidden className="align-inset-ticks" /> : null}
      <div
        className={cn(
          "flex flex-col justify-center gap-2 rounded-xl bg-fg/75 px-4 py-3 sm:px-5",
          right ? "absolute inset-[10px]" : "align-inset-guess",
        )}
      >
        <span className="h-2 w-20 rounded-full bg-surface/85 sm:w-24" />
        <span className="h-2 w-[min(9rem,70%)] rounded-full bg-surface/50" />
        <span className="font-mono text-[10px] text-surface/55">{right ? "inset: 10px" : "translate(6px, −4px)"}</span>
      </div>
    </div>
  );
}
