import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  Copy,
  Layers,
  Repeat,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useLocale } from "./lib/site-locale";
import {
  calcCylinderVisual,
  calcItemOffset,
  DEFAULT_ITEM_HEIGHT,
  formatTimeString,
  pad2,
  resolveScrollIndex,
  WHEEL_COMPARISONS,
} from "./lib/machines";
import { FORMULA } from "./lib/kinds";
import { cn } from "./lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function StudyView() {
  const locale = useLocale();
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [enableCylinderDepth, setEnableCylinderDepth] = useState(true);
  const [comparisonMode, setComparisonMode] = useState<"wheel" | "input" | "dropdown">("wheel");
  const [copied, setCopied] = useState(false);

  // Manual input state for naive comparison
  const [inputText, setInputText] = useState("08:30");
  const [inputError, setInputError] = useState<string | null>(null);

  function copyPrompt() {
    const text = locale === "en" ? FORMULA.prompt.en : FORMULA.prompt.zh;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleInputChange(val: string) {
    setInputText(val);
    const parts = val.split(":");
    if (parts.length !== 2) {
      setInputError(locale === "en" ? "Format error: use HH:MM" : "格式错误：请使用 HH:MM");
      return;
    }
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || h < 0 || h > 23 || Number.isNaN(m) || m < 0 || m > 59) {
      setInputError(
        locale === "en" ? "Value out of range (00-23 : 00-59)" : "数值超限（小时00-23，分钟00-59）",
      );
      return;
    }
    setInputError(null);
    setHour(h);
    setMinute(m);
  }

  return (
    <div className="space-y-12">
      {/* Educational Header Banner */}
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                Study 5217
              </span>
              <span className="text-xs font-mono text-fg-subtle">Continuous · Discrete</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-fg">
              {locale === "en" ? "Wheel Picker · Baseline Snap & Depth" : "滚轮选择器 · 基准吸附与圆柱景深"}
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-2xl leading-relaxed">
              {locale === "en"
                ? "Selecting ordered discrete values or time steps should never pop an obstructive soft keyboard or span an unscrollable 60-row flat list. A wheel picker binds continuous flick gestures to a central baseline snap track while optical cylinder transforms establish hierarchy."
                : "有序离散数据或时间刻度，不要弹虚拟键盘也不要展开60项长列表。上下拨动连续滑动，松手依据滚动吸附中央基准线，离基准线越远透明度与尺寸沿圆柱面几何递减。"}
            </p>
          </div>

          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-medium text-fg shadow-xs hover:bg-surface active:scale-95 transition-all"
          >
            {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
            <span>{copied ? (locale === "en" ? "Copied Prompt" : "已复制提示词") : (locale === "en" ? "Copy AI Prompt" : "复制 AI 提示词")}</span>
          </button>
        </div>

        {/* The Core Formula Bar */}
        <div className="mt-6 rounded-2xl border border-border/80 bg-surface-2/60 p-4">
          <p className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider">
            {locale === "en" ? "Interaction Formula: Name + Gesture + Result" : "交互公式：控件名称 + 触发手势 + 展开结果"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
            <span className="rounded-lg bg-surface px-2.5 py-1 border border-border shadow-xs text-accent">
              {locale === "en" ? FORMULA.name.en : FORMULA.name.zh}
            </span>
            <span className="text-fg-subtle">+</span>
            <span className="rounded-lg bg-surface px-2.5 py-1 border border-border shadow-xs">
              {locale === "en" ? FORMULA.gesture.en : FORMULA.gesture.zh}
            </span>
            <span className="text-fg-subtle">+</span>
            <span className="rounded-lg bg-surface px-2.5 py-1 border border-border shadow-xs">
              {locale === "en" ? FORMULA.result.en : FORMULA.result.zh}
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Phone Stage Area */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-[38px] border border-border bg-surface p-4 shadow-2xl relative">
            {/* Phone Speaker Notch */}
            <div className="absolute top-2 left-1/2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-border/40" />

            <div className="relative rounded-[28px] bg-surface-2 border border-border/50 overflow-hidden flex flex-col h-[520px]">
              {/* Phone Status bar */}
              <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-medium text-fg-muted">
                <span className="tabular-nums">9:41</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Title / Action bar */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-border/40">
                <span className="text-xs text-fg-muted">取消</span>
                <h3 className="text-sm font-semibold text-fg">编辑闹钟</h3>
                <span className="text-xs text-accent font-semibold">保存</span>
              </div>

              {/* Time display */}
              <div className="py-4 text-center">
                <p className="font-mono text-4xl font-extrabold tracking-tight text-fg tabular-nums">
                  {formatTimeString(hour, minute)}
                </p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  {hour < 12 ? (locale === "en" ? "Morning Alarm" : "上午响铃") : (locale === "en" ? "Afternoon / Evening Alarm" : "下午/晚间响铃")}
                </p>
              </div>

              {/* Playground Switcher: Wheel vs Naive Input vs Naive Flat Dropdown */}
              {comparisonMode === "wheel" && (
                <div className="mx-4 mb-2 rounded-2xl border border-border/80 bg-surface p-2 shadow-xs">
                  <div className="mb-1 flex px-3 text-center text-[10px] font-semibold text-fg-subtle uppercase tracking-wider">
                    <span className="flex-1">小时</span>
                    <span className="flex-1">分钟</span>
                  </div>

                  <div className="relative h-[200px] overflow-hidden rounded-xl bg-surface-2/70">
                    {/* Baseline Highlight Line */}
                    <div
                      className="pointer-events-none absolute inset-x-2 z-20 rounded-lg border-y border-accent/50 bg-accent-soft/40 shadow-xs"
                      style={{
                        top: `calc(50% - ${DEFAULT_ITEM_HEIGHT / 2}px)`,
                        height: DEFAULT_ITEM_HEIGHT,
                      }}
                    />

                    {/* Gradient Shadows */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-linear-to-b from-surface-2 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-linear-to-t from-surface-2 to-transparent" />

                    <div className="flex h-full">
                      {/* Hour Wheel Column */}
                      <WheelColumn
                        items={HOURS}
                        value={hour}
                        onChange={setHour}
                        itemHeight={DEFAULT_ITEM_HEIGHT}
                        enableDepth={enableCylinderDepth}
                        label="小时选择"
                      />

                      {/* Minute Wheel Column */}
                      <WheelColumn
                        items={MINUTES}
                        value={minute}
                        onChange={setMinute}
                        itemHeight={DEFAULT_ITEM_HEIGHT}
                        enableDepth={enableCylinderDepth}
                        label="分钟选择"
                      />
                    </div>
                  </div>
                </div>
              )}

              {comparisonMode === "input" && (
                <div className="mx-4 mb-2 rounded-2xl border border-wrong/40 bg-surface p-4 shadow-xs flex flex-col justify-center flex-1">
                  <span className="text-xs font-semibold text-wrong flex items-center gap-1.5">
                    ⚠️ 错误替代：全屏软键盘敲入
                  </span>
                  <p className="mt-1 text-xs text-fg-muted">
                    弹起键盘后会遮挡页面下半部，且用户可能输入任意非法时间字符。
                  </p>
                  <div className="mt-4">
                    <label className="block text-[11px] font-medium text-fg-subtle">输入时间 (HH:MM)</label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="08:30"
                      className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-lg font-bold text-fg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {inputError && (
                      <p className="mt-1 text-xs text-wrong font-medium">{inputError}</p>
                    )}
                  </div>
                  <div className="mt-4 rounded-xl bg-wrong/10 p-2.5 text-[11px] text-wrong">
                    需要正则拦截、键盘弹出布局重排、格式校验与失焦提示，认知摩擦倍增。
                  </div>
                </div>
              )}

              {comparisonMode === "dropdown" && (
                <div className="mx-4 mb-2 rounded-2xl border border-amber-500/40 bg-surface p-4 shadow-xs flex flex-col flex-1 overflow-hidden">
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                    ⚠️ 笨拙替代：60 项平铺长列表
                  </span>
                  <p className="mt-1 text-xs text-fg-muted">
                    平铺展开 60 个数字塞满视口，没有曲面景深提示，手指需反复快速滑拉。
                  </p>
                  <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-border bg-surface-2 divide-y divide-border/60">
                    {MINUTES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinute(m)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-xs font-mono",
                          minute === m ? "bg-accent-soft text-accent font-bold" : "text-fg hover:bg-surface",
                        )}
                      >
                        <span>{pad2(hour)}:{pad2(m)}</span>
                        {minute === m && <Check className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Settings List */}
              <div className="mt-auto border-t border-border bg-surface px-5 py-2.5 text-xs text-fg divide-y divide-border/60">
                <div className="flex items-center justify-between py-2">
                  <span className="text-fg-muted flex items-center gap-1.5">
                    <Repeat className="size-3.5" /> 重复
                  </span>
                  <span className="text-fg font-medium">工作日</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-fg-muted flex items-center gap-1.5">
                    <Bell className="size-3.5" /> 标签
                  </span>
                  <span className="text-fg font-medium">早晨例会</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-fg-subtle text-center max-w-xs">
            {locale === "en"
              ? "Drag or scroll each column. On release, inertia and snap resolve to the nearest discrete baseline line."
              : "上下拖动或滚动小时/分钟列。松手后惯性与 scroll-snap 自动吸附至中央基准线。"}
          </p>
        </div>

        {/* Right / Controls & Deep Explanation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Chips */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">
              {locale === "en" ? "Time Presets & Fast Jumps" : "快速预设与时间跳转"}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { h: 7, m: 0, label: "07:00 晨间闹钟" },
                { h: 8, m: 30, label: "08:30 晨会" },
                { h: 12, m: 45, label: "12:45 午餐休息" },
                { h: 18, m: 30, label: "18:30 下班同步" },
                { h: 23, m: 15, label: "23:15 睡前阅读" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setHour(preset.h);
                    setMinute(preset.m);
                    setInputText(formatTimeString(preset.h, preset.m));
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                    hour === preset.h && minute === preset.m
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface-2 text-fg hover:bg-surface",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Quick Micro Adjusters */}
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 text-xs">
              <span className="text-fg-subtle self-center text-[11px] mr-2">微调步长:</span>
              <button
                type="button"
                onClick={() => setMinute((m) => (m + 5) % 60)}
                className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-fg hover:bg-surface"
              >
                +5 分钟
              </button>
              <button
                type="button"
                onClick={() => setMinute((m) => (m + 15) % 60)}
                className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-fg hover:bg-surface"
              >
                +15 分钟
              </button>
              <button
                type="button"
                onClick={() => setHour((h) => (h + 1) % 24)}
                className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-fg hover:bg-surface"
              >
                +1 小时
              </button>
              <button
                type="button"
                onClick={() => {
                  setHour(8);
                  setMinute(30);
                  setInputText("08:30");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-fg-muted hover:bg-surface ml-auto"
              >
                <RotateCcw className="size-3" /> 重置 08:30
              </button>
            </div>
          </div>

          {/* Perspective & Comparison Switchers */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">
              {locale === "en" ? "Optical Depth & Comparison Toggles" : "视错觉景深与对比实验"}
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-border/80">
              <div>
                <p className="text-xs font-semibold text-fg flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-accent" />
                  <span>圆柱景深模拟 (Cylinder 3D Perspective)</span>
                </p>
                <p className="text-[11px] text-fg-muted mt-0.5">
                  沿 Y 轴距离计算 rotateX 倾角与透明度衰减，模拟实体转轮凸面感
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableCylinderDepth((v) => !v)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  enableCylinderDepth ? "bg-accent" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    enableCylinderDepth ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            {/* Model Comparison switcher */}
            <div>
              <p className="text-xs font-medium text-fg mb-2">对比不同输入控件在触控移动端的代偿：</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "wheel" as const, label: "滚轮选择器 (推荐)" },
                  { id: "input" as const, label: "文本输入框" },
                  { id: "dropdown" as const, label: "60项平铺列表" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setComparisonMode(item.id)}
                    className={cn(
                      "rounded-xl border p-2.5 text-left text-xs font-medium transition-all",
                      comparisonMode === item.id
                        ? "border-accent bg-accent-soft text-accent shadow-xs"
                        : "border-border bg-surface-2 text-fg-muted hover:bg-surface",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical & Visual Breakdown */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="size-3.5" />
              <span>{locale === "en" ? "The Core Mechanics Behind Wheel Picker" : "滚轮选择器的三大核心机制"}</span>
            </h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
                <p className="font-semibold text-fg">1. 纵向滚动 + Scroll Snap</p>
                <p className="mt-1 text-fg-muted leading-relaxed">
                  每项固定 40px 高度。浏览器原生 `scroll-snap-type: y mandatory` 或松手后通过 Math.round(scrollTop / 40) 进行离散取整吸附。
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
                <p className="font-semibold text-fg">2. 圆柱曲面透视渐变</p>
                <p className="mt-1 text-fg-muted leading-relaxed">
                  离中央基准线越远，透明度衰减至 18%，文字绕 X 轴旋转 -18° × offset 并缩放，营造物理滚筒的立体边缘景深。
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3">
                <p className="font-semibold text-fg">3. 双列独立与点选居中</p>
                <p className="mt-1 text-fg-muted leading-relaxed">
                  时与分独立滚动互不干扰；用户直接点击任意偏离基准线的选项时，平滑自动滚动居中，兼顾拨动与点选。
                </p>
              </div>
            </div>

            {/* Structured Comparison Table */}
            <div className="mt-5 overflow-x-auto border-t border-border pt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-fg-subtle">
                    <th className="pb-2 font-medium">控件形态</th>
                    <th className="pb-2 font-medium">软键盘干扰</th>
                    <th className="pb-2 font-medium">非法值风险</th>
                    <th className="pb-2 font-medium">触控阻尼与操作手感</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-fg">
                  {WHEEL_COMPARISONS.map((comp) => (
                    <tr key={comp.name} className="py-2.5">
                      <td className="py-2.5 font-semibold">{comp.name}</td>
                      <td className="py-2.5">
                        {comp.keyboardSpam ? (
                          <span className="text-wrong font-medium">弹起遮挡</span>
                        ) : (
                          <span className="text-accent font-medium">无键盘干扰</span>
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
    </div>
  );
}

function WheelColumn({
  items,
  value,
  onChange,
  itemHeight,
  enableDepth,
  label,
}: {
  items: number[];
  value: number;
  onChange: (next: number) => void;
  itemHeight: number;
  enableDepth: boolean;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const isInternalScroll = useRef(false);

  // Sync scroll on external value change
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isInternalScroll.current) {
      isInternalScroll.current = false;
      return;
    }
    const idx = items.indexOf(value);
    if (idx !== -1) {
      el.scrollTop = idx * itemHeight;
      setScrollTop(idx * itemHeight);
    }
  }, [value, items, itemHeight]);

  function handleClickItem(val: number) {
    const idx = items.indexOf(val);
    if (idx === -1) return;
    isInternalScroll.current = false;
    onChange(val);
    containerRef.current?.scrollTo({
      top: idx * itemHeight,
      behavior: "smooth",
    });
  }

  const stageHeight = 200;
  const paddingY = Math.max(0, (stageHeight - itemHeight) / 2);

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={label}
      onScroll={(e) => {
        const top = e.currentTarget.scrollTop;
        setScrollTop(top);
        const { index } = resolveScrollIndex(top, itemHeight, items.length);
        const nextVal = items[index];
        if (nextVal !== undefined && nextVal !== value) {
          isInternalScroll.current = true;
          onChange(nextVal);
        }
      }}
      className="flex-1 overflow-y-auto overscroll-contain select-none focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        scrollSnapType: "y mandatory",
      }}
    >
      {items.map((n, idx) => {
        const offset = calcItemOffset(idx, Math.round(scrollTop / itemHeight));
        const visual = calcCylinderVisual(offset);
        const isSelected = n === value;

        return (
          <button
            key={n}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => handleClickItem(n)}
            className="flex w-full items-center justify-center font-mono text-xl tabular-nums transition-transform"
            style={{
              height: itemHeight,
              scrollSnapAlign: "center",
              opacity: enableDepth ? visual.opacity : isSelected ? 1 : 0.45,
              transform: enableDepth
                ? `perspective(240px) rotateX(${visual.rotateXDeg}deg) scale(${visual.scale})`
                : undefined,
              color: isSelected ? "var(--color-accent)" : "var(--color-fg)",
              fontWeight: isSelected ? "700" : "500",
            }}
          >
            {pad2(n)}
          </button>
        );
      })}
    </div>
  );
}
