import { useRef, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useLocale } from "./lib/site-locale";
import {
  calcCylinderVisual,
  DEFAULT_ITEM_HEIGHT,
  formatTimeString,
  pad2,
  WHEEL_COMPARISONS,
} from "./lib/machines";
import { FORMULA } from "./lib/kinds";
import { cn } from "./lib/utils";
import { type WheelVisualFrame } from "./wheel/appearance";
import { WheelColumn } from "./wheel/WheelColumn";
import { WheelDrum } from "./wheel/WheelDrum";
import "./wheel/wheel.css";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PRESETS = [
  { h: 7, m: 0, zh: "07:00 晨间", en: "07:00 morning" },
  { h: 8, m: 30, zh: "08:30 晨会", en: "08:30 standup" },
  { h: 12, m: 45, zh: "12:45 午休", en: "12:45 lunch" },
  { h: 18, m: 30, zh: "18:30 下班", en: "18:30 wrap" },
  { h: 23, m: 15, zh: "23:15 阅读", en: "23:15 reading" },
] as const;

export function StudyView() {
  const locale = useLocale();
  const zh = locale !== "en";
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [enableCylinderDepth, setEnableCylinderDepth] = useState(true);
  const [comparisonMode, setComparisonMode] = useState<"wheel" | "input" | "dropdown">("wheel");
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState("08:30");
  const [inputError, setInputError] = useState<string | null>(null);
  const [hourFrame, setHourFrame] = useState<WheelVisualFrame>({
    fraction: 8,
    index: 8,
    scrollTop: 8 * DEFAULT_ITEM_HEIGHT,
  });
  const [minuteFrame, setMinuteFrame] = useState<WheelVisualFrame>({
    fraction: 30,
    index: 30,
    scrollTop: 30 * DEFAULT_ITEM_HEIGHT,
  });
  const [tracking, setTracking] = useState(false);
  const trackingTimer = useRef<ReturnType<typeof setTimeout> | 0>(0);

  function markTracking() {
    setTracking(true);
    if (trackingTimer.current) clearTimeout(trackingTimer.current);
    trackingTimer.current = setTimeout(() => setTracking(false), 140);
  }

  function copyPrompt() {
    navigator.clipboard.writeText(zh ? FORMULA.prompt.zh : FORMULA.prompt.en);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function applyTime(h: number, m: number) {
    setHour(h);
    setMinute(m);
    setInputText(formatTimeString(h, m));
    setInputError(null);
  }

  function handleInputChange(val: string) {
    setInputText(val);
    const parts = val.split(":");
    if (parts.length !== 2) {
      setInputError(zh ? "格式错误：请使用 HH:MM" : "Format error: use HH:MM");
      return;
    }
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || h < 0 || h > 23 || Number.isNaN(m) || m < 0 || m > 59) {
      setInputError(zh ? "数值超限（小时 00–23，分钟 00–59）" : "Out of range (00–23 : 00–59)");
      return;
    }
    setInputError(null);
    setHour(h);
    setMinute(m);
  }

  const hourOffset = hourFrame.fraction - hourFrame.index;
  const neighbor = calcCylinderVisual(1);

  return (
    <div className="space-y-14">
      <section className="grid min-w-0 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-fg-subtle">
            {zh ? "连续拨动 · 离散吸附" : "Continuous flick · Discrete snap"}
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.45rem]">
            {zh
              ? "有序刻度，这一格是敲键盘、铺长列表，还是滚轮对齐基准线？"
              : "For ordered scales, type, flatten a list, or snap a wheel to a baseline?"}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">
            {zh
              ? "上下拨动是连续的；松手按 40px 一格取整，停在中央基准线。离线越远，透明度、倾角与尺寸沿圆柱面递减——中央实，边缘虚。"
              : "The flick is continuous; release rounds to a 40px row on the center baseline. Farther from that line, opacity, tilt and scale fall off along the cylinder."}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            {zh ? "交互公式" : "Formula"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-semibold">
            <span className="rounded-lg border border-border bg-accent-soft px-2.5 py-1 text-accent">
              {zh ? "滚轮选择器" : "Wheel picker"}
            </span>
            <span className="text-fg-subtle">+</span>
            <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1">
              {zh ? "上下拨动" : "Vertical flick"}
            </span>
            <span className="text-fg-subtle">+</span>
            <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1">
              {zh ? "基准线对齐" : "Baseline snap"}
            </span>
          </div>
          <button
            type="button"
            onClick={copyPrompt}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-fg-muted hover:text-fg"
          >
            {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
            {copied ? (zh ? "已复制" : "Copied") : zh ? "复制提示词" : "Copy prompt"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="flex flex-col items-center lg:col-span-5">
          <div className="wheel-phone">
            <div className="wheel-phone-notch" />
            <div className="wheel-phone-screen">
              <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium text-fg-muted">
                <span className="tabular-nums">9:41</span>
                <span>5G · 100%</span>
              </div>

              <div className="flex items-center justify-between px-5 pt-3 pb-2">
                <span className="text-xs text-fg-muted">{zh ? "取消" : "Cancel"}</span>
                <h2 className="text-sm font-semibold">{zh ? "编辑闹钟" : "Edit alarm"}</h2>
                <span className="text-xs font-semibold text-accent">{zh ? "保存" : "Save"}</span>
              </div>

              <div className="px-5 pb-3 pt-1 text-center">
                <p className="font-mono text-[2.75rem] font-semibold leading-none tracking-tight tabular-nums text-fg">
                  {formatTimeString(hour, minute)}
                </p>
                <p className="mt-1.5 text-[11px] text-fg-muted">
                  {hour < 12
                    ? zh
                      ? "上午响铃 · 一次"
                      : "Morning · once"
                    : zh
                      ? "下午 / 晚间响铃 · 一次"
                      : "Afternoon · once"}
                </p>
              </div>

              {comparisonMode === "wheel" && (
                <div className="mx-3 rounded-2xl border border-border/80 bg-surface p-3 shadow-card">
                  <WheelDrum
                    hourLabel={zh ? "小时" : "Hour"}
                    minuteLabel={zh ? "分钟" : "Minute"}
                    tracking={tracking}
                  >
                    <WheelColumn
                      items={HOURS}
                      value={hour}
                      onChange={(next) => {
                        setHour(next);
                        markTracking();
                      }}
                      itemHeight={DEFAULT_ITEM_HEIGHT}
                      enableDepth={enableCylinderDepth}
                      label={zh ? "小时选择" : "Hour"}
                      onVisualFrame={(frame) => {
                        setHourFrame(frame);
                        if (Math.abs(frame.fraction - frame.index) > 0.05) markTracking();
                      }}
                    />
                    <WheelColumn
                      items={MINUTES}
                      value={minute}
                      onChange={(next) => {
                        setMinute(next);
                        markTracking();
                      }}
                      itemHeight={DEFAULT_ITEM_HEIGHT}
                      enableDepth={enableCylinderDepth}
                      label={zh ? "分钟选择" : "Minute"}
                      onVisualFrame={(frame) => {
                        setMinuteFrame(frame);
                        if (Math.abs(frame.fraction - frame.index) > 0.05) markTracking();
                      }}
                    />
                  </WheelDrum>
                </div>
              )}

              {comparisonMode === "input" && (
                <div className="mx-3 flex flex-1 flex-col rounded-2xl border border-wrong/35 bg-surface p-4">
                  <p className="text-xs font-semibold text-wrong">
                    {zh ? "代偿：弹出软键盘" : "Compromise: soft keyboard"}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                    {zh
                      ? "下半屏被挡住，还可能敲出 25:80。非法值要靠校验兜底。"
                      : "The keyboard covers the sheet and invites 25:80. Validity becomes a cleanup job."}
                  </p>
                  <label className="mt-4 block text-[11px] text-fg-subtle">HH:MM</label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="08:30"
                    className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {inputError && <p className="mt-1 text-xs font-medium text-wrong">{inputError}</p>}
                </div>
              )}

              {comparisonMode === "dropdown" && (
                <div className="mx-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold text-fg">
                    {zh ? "代偿：60 项平铺" : "Compromise: 60-row list"}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                    {zh
                      ? "没有基准线，也没有圆柱衰减。快滑极易越过目标。"
                      : "No baseline, no cylindrical falloff. Fast flicks overshoot."}
                  </p>
                  <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-border bg-surface-2">
                    {MINUTES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinute(m)}
                        className={cn(
                          "flex w-full items-center justify-between border-b border-border/50 px-3 py-2 font-mono text-xs",
                          minute === m ? "bg-accent-soft font-bold text-accent" : "text-fg",
                        )}
                      >
                        <span>
                          {pad2(hour)}:{pad2(m)}
                        </span>
                        {minute === m && <Check className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto divide-y divide-border/70 border-t border-border bg-surface px-5 py-2 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-fg-muted">{zh ? "重复" : "Repeat"}</span>
                  <span className="font-medium">{zh ? "工作日" : "Weekdays"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-fg-muted">{zh ? "标签" : "Label"}</span>
                  <span className="font-medium">{zh ? "早晨例会" : "Standup"}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-center text-[12px] leading-relaxed text-fg-subtle">
            {zh
              ? "拨动或点选一列。松手后仍按原来的 round(scrollTop / 40) 吸附，基准线会在跟手时略微变淡。"
              : "Flick or tap a column. Release still snaps with round(scrollTop / 40); the reticle eases while tracking."}
          </p>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <div className="wheel-readout">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                  {zh ? "中央基准 · 此刻" : "Baseline now"}
                </p>
                <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight">
                  {formatTimeString(hour, minute)}
                </p>
              </div>
              <p className="text-right text-[11px] leading-relaxed text-fg-muted">
                {tracking ? (zh ? "跟手中" : "Tracking") : zh ? "已对齐" : "Settled"}
              </p>
            </div>
            <p className="wheel-readout-eq">
              round(<strong>{hourFrame.scrollTop.toFixed(0)}</strong> / {DEFAULT_ITEM_HEIGHT}) ={" "}
              <strong>{hourFrame.index}</strong>
              <span className="text-fg-subtle"> → {pad2(hour)}</span>
              <span className="mx-2 text-fg-subtle">·</span>
              round(<strong>{minuteFrame.scrollTop.toFixed(0)}</strong> / {DEFAULT_ITEM_HEIGHT}) ={" "}
              <strong>{minuteFrame.index}</strong>
              <span className="text-fg-subtle"> → {pad2(minute)}</span>
            </p>
            <p className="text-[11px] text-fg-muted">
              {zh ? "小时偏离" : "Hour drift"} {hourOffset.toFixed(2)} · {zh ? "邻项" : "neighbor"}{" "}
              opacity {neighbor.opacity.toFixed(2)} · rotateX {neighbor.rotateXDeg}° · scale{" "}
              {neighbor.scale.toFixed(2)}
            </p>
            <DepthStrip />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{zh ? "圆柱景深" : "Cylinder depth"}</p>
                <p className="mt-0.5 text-[12px] text-fg-muted">
                  {zh
                    ? "关掉后只剩平面对比，基准线还在，曲面没有了。"
                    : "Off: flat contrast only. The baseline stays; the drum does not."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableCylinderDepth}
                onClick={() => setEnableCylinderDepth((v) => !v)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                  enableCylinderDepth ? "bg-accent" : "bg-border-strong",
                )}
              >
                <span
                  className={cn(
                    "inline-block size-5 rounded-full bg-white shadow transition",
                    enableCylinderDepth ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <p className="mt-4 text-[12px] font-medium text-fg">
              {zh ? "对照另一种输入" : "Compare another control"}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  { id: "wheel" as const, zh: "滚轮", en: "Wheel" },
                  { id: "input" as const, zh: "文本框", en: "Text field" },
                  { id: "dropdown" as const, zh: "平铺列表", en: "Flat list" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setComparisonMode(item.id)}
                  className={cn(
                    "rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                    comparisonMode === item.id
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface-2 text-fg-muted hover:bg-surface",
                  )}
                >
                  {zh ? item.zh : item.en}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              {zh ? "跳到一格" : "Jump a tick"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.zh}
                  type="button"
                  onClick={() => applyTime(preset.h, preset.m)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                    hour === preset.h && minute === preset.m
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface-2 text-fg hover:bg-surface",
                  )}
                >
                  {zh ? preset.zh : preset.en}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 text-xs">
              <button
                type="button"
                onClick={() => applyTime(hour, (minute + 5) % 60)}
                className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 hover:bg-surface"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => applyTime(hour, (minute + 15) % 60)}
                className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 hover:bg-surface"
              >
                +15
              </button>
              <button
                type="button"
                onClick={() => applyTime((hour + 1) % 24, minute)}
                className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 hover:bg-surface"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => applyTime(8, 30)}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-fg-muted hover:bg-surface"
              >
                <RotateCcw className="size-3" />
                08:30
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(
              [
                {
                  t: zh ? "滚动量化" : "Quantize",
                  d: zh
                    ? "每项 40px。松手 round(scrollTop / 40)，不停在两行缝上。"
                    : "40px rows. Release rounds scrollTop / 40 — never a seam.",
                },
                {
                  t: zh ? "圆柱衰减" : "Cylinder",
                  d: zh
                    ? "离基准越远越淡、越斜、越小；边缘略虚。中央是唯一实的一行。"
                    : "Farther rows fade, tilt and shrink. Only the baseline stays solid.",
                },
                {
                  t: zh ? "双列独立" : "Two drums",
                  d: zh
                    ? "时、分各滚各的。远距拨动，近距点选居中。"
                    : "Hours and minutes do not share a gesture. Flick far, tap near.",
                },
              ] as const
            ).map((card) => (
              <article
                key={card.t}
                className="rounded-2xl border border-border bg-surface p-4 shadow-card"
              >
                <h3 className="text-sm font-semibold">{card.t}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-fg-muted">{card.d}</p>
              </article>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-5 shadow-card">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-fg-subtle">
                  <th className="pb-2 font-medium">{zh ? "形态" : "Control"}</th>
                  <th className="pb-2 font-medium">{zh ? "键盘" : "Keyboard"}</th>
                  <th className="pb-2 font-medium">{zh ? "非法值" : "Invalid"}</th>
                  <th className="pb-2 font-medium">{zh ? "触控" : "Touch"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {WHEEL_COMPARISONS.map((comp) => (
                  <tr key={comp.name}>
                    <td className="py-2.5 font-semibold">{zh ? comp.name : comp.nameEn}</td>
                    <td className="py-2.5">
                      {comp.keyboardSpam ? (
                        <span className="font-medium text-wrong">{zh ? "弹起遮挡" : "Blocks"}</span>
                      ) : (
                        <span className="font-medium text-accent">{zh ? "无干扰" : "None"}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-fg-muted">{comp.validationRisk}</td>
                    <td className="py-2.5 text-fg-muted">{comp.touchFriction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepthStrip() {
  const locale = useLocale();
  const zh = locale !== "en";
  const samples = [-2, -1, 0, 1, 2];

  return (
    <div>
      <p className="mb-2 text-[11px] text-fg-subtle">
        {zh ? "离基准线的圆柱量（固定几何，不是另一套吸附）" : "Cylinder amounts by offset — same geometry, not a second snap"}
      </p>
      <div className="wheel-depth-row">
        {samples.map((offset) => {
          const visual = calcCylinderVisual(offset);
          return (
            <div
              key={offset}
              className={cn("wheel-depth-cell", visual.isBaseline && "is-base")}
              style={{ opacity: Math.max(0.45, visual.opacity) }}
            >
              <span className="text-[10px] text-fg-subtle">{offset > 0 ? `+${offset}` : offset}</span>
              <span
                className="text-sm font-semibold"
                style={{
                  transform: `scale(${visual.scale})`,
                  color: visual.isBaseline ? "var(--color-accent)" : "var(--color-fg)",
                }}
              >
                {visual.opacity.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
