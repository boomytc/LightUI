import { Check, LayoutGrid, Play } from "lucide-react";
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
    case "numeric":
      return <NumericFigure state={state} />;
    case "between":
      return <BetweenFigure state={state} />;
    case "reading":
      return <ReadingFigure state={state} />;
    case "center":
      return <CenterFigure state={state} />;
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

const NUMERIC_ROWS = [
  { zh: "课程材料", en: "Materials", right: "29.00", wrong: "29" },
  { zh: "单次辅导", en: "Coaching", right: "199.00", wrong: "199" },
  { zh: "进阶工作坊", en: "Workshop", right: "1,299.00", wrong: "1299" },
];

function NumericFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="relative w-full min-w-0">
      <div className="mb-2 grid grid-cols-[1fr_7.5rem] items-end text-[10px] font-medium tracking-[0.1em] text-fg-subtle uppercase">
        <span>{pick({ zh: "费用明细", en: "Item" }, locale)}</span>
        <span className={right ? "text-right" : "text-left"}>
          {pick({ zh: "金额 / 元", en: "Amount / ¥" }, locale)}
        </span>
      </div>
      <div className="relative divide-y divide-border border-y border-border">
        {NUMERIC_ROWS.map((row, idx) => (
          <div key={row.zh} className="grid grid-cols-[1fr_7.5rem] items-baseline gap-3 py-2.5">
            <span className="truncate text-[13px] font-medium text-fg">
              {pick(row, locale)}
            </span>
            {right ? (
              <span className="text-right font-mono text-[15px] font-semibold tracking-tight text-fg tabular-nums sm:text-[1.05rem]">
                {row.right.slice(0, -3)}
                <span className="relative inline-block">
                  .
                  {idx === 0 ? <span aria-hidden className="align-decimal-guide" /> : null}
                </span>
                {row.right.slice(-2)}
              </span>
            ) : (
              <span className="text-left font-sans text-[15px] font-normal tracking-tight text-fg sm:text-[1.05rem]">
                {idx === 0 ? (
                  <span className="relative inline-block">
                    {row.wrong}
                    <span aria-hidden className="align-wrong-digit-guide" />
                  </span>
                ) : (
                  row.wrong
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const BETWEEN_ROWS = [
  { zh: "AI 产品实践入门", en: "AI Product Practice", status: { zh: "待确认", en: "Pending" }, tone: "accent" as const },
  { zh: "需求梳理工作坊", en: "Requirement Scope", status: { zh: "已确认", en: "Confirmed" }, tone: "intent" as const },
  { zh: "个人项目复盘", en: "Project Review", status: { zh: "已完成", en: "Done" }, tone: "done" as const },
];

function BetweenFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="relative w-full min-w-0">
      {right ? (
        <span aria-hidden className="align-scan-guide" />
      ) : (
        <span aria-hidden className="align-scan-guide-wrong" />
      )}
      <div className="mb-2 text-[10px] font-medium tracking-[0.1em] text-fg-subtle uppercase">
        {pick({ zh: "我的预约记录", en: "Booking records" }, locale)}
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {BETWEEN_ROWS.map((row) => (
          <li
            key={row.zh}
            className={cn(
              "flex items-center py-2.5",
              right ? "justify-between gap-4" : "justify-start gap-3",
            )}
          >
            <span className="min-w-0 truncate text-[13px] font-medium text-fg">
              {pick(row, locale)}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium",
                row.tone === "accent" && "bg-accent-soft text-accent",
                row.tone === "intent" && "bg-intent-soft text-intent",
                row.tone === "done" && "bg-surface-2 text-fg-muted",
              )}
            >
              {pick(row.status, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReadingFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col justify-center">
      {right ? (
        <span aria-hidden className="align-reading-guide" />
      ) : (
        <span aria-hidden className="align-reading-guide-wrong" />
      )}
      <p
        className={cn(
          "font-mono text-[10px] font-medium tracking-wide uppercase text-accent",
          right ? "text-left" : "text-center",
        )}
      >
        {pick({ zh: "小班课程 / 实践入门", en: "Workshop / Hands-on" }, locale)}
      </p>
      <h3
        className={cn(
          "mt-1.5 text-[15px] font-semibold leading-snug tracking-tight text-fg sm:text-[1.05rem]",
          right ? "text-left" : "text-center",
        )}
      >
        {pick(
          { zh: "把专业经验，变成你的第一个产品", en: "Turn your expertise into a real product" },
          locale,
        )}
      </h3>
      <p
        className={cn(
          "mt-2 text-[12px] leading-relaxed text-fg-muted",
          right ? "text-left" : "text-center",
        )}
      >
        {pick(
          {
            zh: "从真实工作场景出发，用 AI 搭建可用页面并完成首轮验证。",
            en: "Start with a real need from your work. Build testable UI with AI.",
          },
          locale,
        )}
      </p>
      <div
        className={cn(
          "mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] text-fg-subtle",
          right ? "justify-start" : "justify-center",
        )}
      >
        <span className="rounded bg-surface-2 px-1.5 py-0.5">
          {pick({ zh: "90分钟", en: "90 min" }, locale)}
        </span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5">
          {pick({ zh: "线上实操", en: "Live lab" }, locale)}
        </span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5">
          {pick({ zh: "课后答疑", en: "Q&A" }, locale)}
        </span>
      </div>
    </div>
  );
}

function CenterFigure({ state }: { state: StageState }) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div className="relative mx-auto flex w-full max-w-xs flex-col justify-center">
      {!right ? <span aria-hidden className="align-center-axis-wrong" /> : null}
      <div className="relative flex w-full flex-col items-center text-center">
        {right ? <span aria-hidden className="align-center-axis" /> : null}
        <span
          className="grid size-9 place-items-center rounded-full bg-intent-soft text-intent"
          aria-hidden
        >
          <Check className="size-4" strokeWidth={2.6} />
        </span>
        <h3 className="mt-2 text-[16px] font-semibold tracking-tight text-fg">
          {pick({ zh: "预约成功", en: "Booking Confirmed" }, locale)}
        </h3>
        <button
          type="button"
          tabIndex={-1}
          className="mt-2.5 rounded-lg bg-fg px-3.5 py-1.5 text-[12px] font-medium text-surface shadow-sm"
        >
          {pick({ zh: "查看我的预约", en: "View Booking" }, locale)}
        </button>
      </div>
      <div className="mt-3.5 border-t border-border pt-2.5">
        <dl
          className={cn(
            "space-y-1 text-[11px] text-fg-muted",
            right ? "text-left" : "text-center",
          )}
        >
          <div className={cn("flex gap-2", right ? "justify-start" : "justify-center")}>
            <dt className="w-8 shrink-0 text-fg-subtle">{pick({ zh: "课程", en: "Course" }, locale)}</dt>
            <dd className="font-medium text-fg">{pick({ zh: "AI 产品实践入门", en: "AI Product Practice" }, locale)}</dd>
          </div>
          <div className={cn("flex gap-2", right ? "justify-start" : "justify-center")}>
            <dt className="w-8 shrink-0 text-fg-subtle">{pick({ zh: "时间", en: "Time" }, locale)}</dt>
            <dd>{pick({ zh: "周六 14:00—15:30", en: "Sat 14:00–15:30" }, locale)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
