import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Bold, Check, Italic, Link2, List, Mail, Search, Send, User } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import {
  contentAfterContainer,
  contentVisible,
  fixtureBox,
  morphAnchor,
  morphAxis,
  morphBox,
  morphMs,
  opensExtra,
  reverseBeat,
  reverseBox,
  reverseName,
  reverseOrder,
  reverseStage,
  sameNodes,
  stageState,
  type FixtureState,
  type MorphAnchor,
  type MorphBox,
  type ReverseStage,
} from "../lib/machines";
import { loc, pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import { ComparePane, DemoShell } from "./Frame";
import "./morph.css";

const NAIVE_HINT = {
  "circle-pill": loc("高度跟着放大", "Height scales with it"),
  "pill-card": loc("标题卸掉另开卡", "Title unmounts; new card"),
  compact: loc("控件直接蹦出来", "Controls pop in"),
  radius: loc("连尺寸一起 scale", "Size scales too"),
  size: loc("从中心整块放大", "Grows from the center"),
  reflow: loc("换成另一套节点", "A second set of nodes"),
  reverse: loc("整块淡出卸载", "Fade-unmount the block"),
} as const;

const AXIS_HINT = {
  "circle-pill": loc("只长宽，高度锁死", "Width only; height locked"),
  "pill-card": loc("只长高，标题还在", "Height only; title stays"),
  compact: loc("额外一行 0fr 打开", "Extra row opens 0fr"),
  radius: loc("宽高不动，只收圆角", "Size holds; radius only"),
  size: loc("左上钉住，往右下长", "Pinned top-left"),
  reflow: loc("同一组节点改列", "Same nodes, new columns"),
  reverse: loc("内容先走，容器后收", "Content out, then the box"),
} as const;

export function KindDemo({
  id,
  state,
  compact = false,
}: {
  id: KindId;
  state?: FixtureState;
  compact?: boolean;
}) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const locked = state !== undefined;
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;
  const live = useMorphPlay(id, locked ? state : undefined, reduced);
  const [naiveOn, setNaiveOn] = useState(live.expanded);
  const axis = morphAxis(id);
  const anchor = morphAnchor(id);
  const duration = morphMs(reduced);
  const beat =
    id === "reverse"
      ? live.reverseStep === 0 && !live.contentOut
        ? reverseName(0)
        : reverseBeat(live.reverseStep === 0 ? 0 : live.reverseStep)
      : null;

  useEffect(() => {
    setNaiveOn(live.expanded);
  }, [id, locked, live.expanded]);

  function onToggle() {
    if (locked || live.busy) return;
    if (id === "reverse") setNaiveOn((v) => !v);
    live.toggle();
  }

  const naiveExpanded = id === "reverse" ? naiveOn : live.expanded;
  const axisBox = live.box;
  const wrongBox = naiveFixtureBox(id, naiveExpanded);
  const wrongAnchor = naiveAnchor(id);

  const face = (variant: "axis" | "naive", expanded: boolean) => (
    <KindFace
      id={id}
      locale={locale}
      variant={variant}
      expanded={variant === "naive" ? expanded : live.expanded}
      contentOpen={variant === "naive" ? expanded : live.contentOpen}
      extraOpen={variant === "naive" ? expanded : live.extraOpen}
      reverseStep={live.reverseStep}
      contentOut={live.contentOut}
    />
  );

  return (
    <DemoShell
      compact={compact}
      title={pick(meta.window, locale)}
      brand={locale === "en" ? "Desk" : "工作台"}
    >
      <div className="flex items-end justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium">{locale === "en" ? "Today" : "今日"}</h3>
          <p className="text-[12px] text-fg-subtle">
            {compact
              ? locale === "en"
                ? "One locked state."
                : "锁住的一帧。"
              : locale === "en"
                ? "One click moves both. Left is the wrong axis."
                : "点一次两边一起走。左边是错的轴。"}
          </p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-fg-subtle">
          {axisBox.width}×{axisBox.height} · r{axisBox.radius}
        </p>
      </div>

      {compact ? (
        <div className="morph-stage" data-anchor={anchor}>
          <MorphFrame
            kind={id}
            box={axisBox}
            anchor={anchor}
            reduced={reduced}
            locked={locked}
            expanded={live.expanded}
            duration={duration}
            onToggle={onToggle}
            label={pick(meta.zh, locale)}
          >
            {face("axis", live.expanded)}
          </MorphFrame>
        </div>
      ) : (
        <div className="morph-compare">
          <ComparePane tone="wrong" hint={pick(NAIVE_HINT[id], locale)}>
            <div className="morph-stage" data-anchor={wrongAnchor}>
              <MorphFrame
                kind={id}
                box={wrongBox}
                anchor={wrongAnchor}
                reduced={reduced}
                locked={locked}
                expanded={naiveExpanded}
                faded={id === "reverse" && !naiveExpanded}
                duration={duration}
                onToggle={onToggle}
                label={pick(NAIVE_HINT[id], locale)}
                naive
              >
                {face("naive", naiveExpanded)}
              </MorphFrame>
            </div>
          </ComparePane>
          <ComparePane tone="right" hint={pick(AXIS_HINT[id], locale)}>
            <div className="morph-stage" data-anchor={anchor}>
              <MorphFrame
                kind={id}
                box={axisBox}
                anchor={anchor}
                reduced={reduced}
                locked={locked}
                expanded={live.expanded}
                duration={duration}
                onToggle={onToggle}
                label={pick(meta.zh, locale)}
              >
                {face("axis", live.expanded)}
              </MorphFrame>
            </div>
          </ComparePane>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] tabular-nums text-fg-subtle">
          {axis}
          {anchor !== "none" ? ` · ${anchor}` : ""}
          {opensExtra(id) ? " · 0fr→1fr" : ""}
          {sameNodes(id) ? (locale === "en" ? " · same nodes" : " · 同一组节点") : ""}
        </p>
        {id === "reverse" && !compact ? (
          <div className="morph-beat" aria-label={locale === "en" ? "Reverse beats" : "收回节拍"}>
            {(
              [
                ["content", locale === "en" ? "content" : "内容"],
                ["height", locale === "en" ? "height" : "高度"],
                ["width", locale === "en" ? "width" : "宽度"],
              ] as const
            ).map(([key, label], i) => {
              const on =
                key === "content"
                  ? live.contentOut || live.reverseStep > 0
                  : key === "height"
                    ? live.reverseStep >= 1
                    : live.reverseStep >= 2;
              const current = beat === key || (i === 0 && beat === "card");
              return (
                <span key={key} data-on={current || on ? "true" : undefined}>
                  {i + 1} {label}
                </span>
              );
            })}
          </div>
        ) : beat ? (
          <p className="font-mono text-[11px] text-fg-subtle">{beat}</p>
        ) : null}
      </div>

      {compact ? null : (
        <ul className="border-t border-border">
          {(locale === "en"
            ? ["Design review", "Sync notes", "Ship list"]
            : ["设计评审", "同步纪要", "发布清单"]
          ).map((row) => (
            <li
              key={row}
              className="border-b border-border px-4 py-2.5 text-[13px] text-fg-muted sm:px-5"
            >
              {row}
            </li>
          ))}
        </ul>
      )}
    </DemoShell>
  );
}

function naiveFixtureBox(kind: KindId, expanded: boolean): MorphBox {
  if (kind === "reverse") return reverseBox(0);
  if (kind === "circle-pill") {
    return expanded
      ? { width: 168, height: 168, radius: 999 }
      : { width: 48, height: 48, radius: 999 };
  }
  if (kind === "radius") {
    return expanded
      ? { width: 420, height: 168, radius: 24 }
      : { width: 360, height: 120, radius: 999 };
  }
  if (kind === "size") {
    const box = morphBox("size", expanded);
    return expanded ? { ...box, radius: 36 } : box;
  }
  return morphBox(kind, expanded);
}

function naiveAnchor(kind: KindId): MorphAnchor {
  if (kind === "circle-pill" || kind === "size" || kind === "reverse") return "center";
  if (kind === "radius") return "none";
  return morphAnchor(kind);
}

function MorphFrame({
  kind,
  box,
  anchor,
  reduced,
  locked,
  expanded,
  faded = false,
  duration,
  onToggle,
  label,
  naive = false,
  children,
}: {
  kind: KindId;
  box: MorphBox;
  anchor: MorphAnchor;
  reduced: boolean;
  locked: boolean;
  expanded: boolean;
  faded?: boolean;
  duration: number;
  onToggle: () => void;
  label: string;
  naive?: boolean;
  children: ReactNode;
}) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (locked) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <div
      data-kind={kind}
      data-anchor={anchor}
      data-naive={naive ? "true" : undefined}
      data-faded={faded ? "true" : undefined}
      data-locked={locked ? "true" : undefined}
      data-reduced={reduced ? "true" : undefined}
      role={locked ? undefined : "button"}
      tabIndex={locked ? undefined : 0}
      aria-expanded={expanded}
      aria-label={label}
      onClick={locked ? undefined : onToggle}
      onKeyDown={onKey}
      className="morph-box"
      style={{
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

function KindFace({
  id,
  locale,
  variant,
  expanded,
  contentOpen,
  extraOpen,
  reverseStep,
  contentOut,
}: {
  id: KindId;
  locale: Locale;
  variant: "axis" | "naive";
  expanded: boolean;
  contentOpen: boolean;
  extraOpen: boolean;
  reverseStep: ReverseStage;
  contentOut: boolean;
}) {
  const late = contentAfterContainer(id);
  const naive = variant === "naive";
  switch (id) {
    case "circle-pill":
      return <CirclePill locale={locale} open={contentOpen} />;
    case "pill-card":
      return naive ? (
        <PillCardNaive locale={locale} open={contentOpen} />
      ) : (
        <PillCard locale={locale} open={contentOpen} late={late} />
      );
    case "compact":
      return naive ? (
        <CompactBarNaive locale={locale} extraOpen={extraOpen} />
      ) : (
        <CompactBar locale={locale} extraOpen={extraOpen} late={late} />
      );
    case "radius":
      return <RadiusRow locale={locale} />;
    case "size":
      return naive ? (
        <SizeCardNaive locale={locale} open={contentOpen} />
      ) : (
        <SizeCard locale={locale} open={contentOpen} late={late} />
      );
    case "reflow":
      return naive ? (
        <ReflowCardNaive locale={locale} open={expanded} />
      ) : (
        <ReflowCard locale={locale} open={expanded} />
      );
    case "reverse":
      return naive ? (
        <ReverseCardNaive locale={locale} open={contentOpen} />
      ) : (
        <ReverseCard locale={locale} step={reverseStep} contentOut={contentOut} />
      );
  }
}

function CirclePill({ locale, open }: { locale: Locale; open: boolean }) {
  return (
    <div className="morph-pill-face bg-fg text-surface" data-open={open ? "true" : undefined}>
      <Search className="size-4 shrink-0" strokeWidth={2.2} />
      <span className="morph-pill-label">{locale === "en" ? "Search files" : "搜索文件"}</span>
    </div>
  );
}

function PillCard({ locale, open, late }: { locale: Locale; open: boolean; late: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 px-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
          <Mail className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">
            {locale === "en" ? "From Lin Yu" : "来自林予"}
          </p>
          <p className="truncate text-[11px] text-fg-subtle">
            {locale === "en" ? "Just now" : "刚刚"}
          </p>
        </div>
      </div>
      <div
        className="morph-late min-h-0 flex-1 overflow-hidden px-4 pb-3"
        data-open={open ? "true" : undefined}
        data-sync={late ? undefined : "true"}
      >
        <p className="text-[13px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Review moved to Thursday. The attachment is updated."
            : "设计评审改到周四，附件已更新。"}
        </p>
        <p className="mt-3 text-[12px] font-medium text-accent">
          {locale === "en" ? "Reply" : "回复"}
        </p>
      </div>
    </div>
  );
}

function PillCardNaive({ locale, open }: { locale: Locale; open: boolean }) {
  if (!open) {
    return (
      <div className="flex h-full items-center gap-3 px-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
          <Mail className="size-3.5" />
        </span>
        <p className="truncate text-[13px] font-medium">
          {locale === "en" ? "From Lin Yu" : "来自林予"}
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-2 px-4 py-4">
      <p className="text-[12px] font-medium text-fg-subtle">
        {locale === "en" ? "New thread" : "新会话"}
      </p>
      <p className="mt-2 text-[14px] font-semibold">
        {locale === "en" ? "Design review" : "设计评审"}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "A second card. The header was thrown away."
          : "另一张卡。标题已经卸掉了。"}
      </p>
    </div>
  );
}

function CompactBar({
  locale,
  extraOpen,
  late,
}: {
  locale: Locale;
  extraOpen: boolean;
  late: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col px-4 py-3">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3">
        <p className="truncate text-[14px] font-semibold">
          {locale === "en" ? "New brief" : "新简报"}
        </p>
        <span className="grid size-8 place-items-center rounded-full bg-fg text-surface">
          <Send className="size-3.5" />
        </span>
      </div>
      <div className="morph-extra" data-open={extraOpen ? "true" : undefined}>
        <div className="morph-extra-inner">
          <div
            className="morph-late pt-2"
            data-open={extraOpen ? "true" : undefined}
            data-sync={late ? undefined : "true"}
          >
            <div className="mb-2 flex gap-1 text-fg-muted">
              <Bold className="size-3.5" />
              <Italic className="size-3.5" />
              <Link2 className="size-3.5" />
              <List className="size-3.5" />
            </div>
            <p className="text-[12px] leading-relaxed text-fg-subtle">
              {locale === "en"
                ? "Same identity. Extra tools open on a 0fr track."
                : "同一份内容。额外工具沿 0fr 打开。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactBarNaive({ locale, extraOpen }: { locale: Locale; extraOpen: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col px-4 py-3">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3">
        <p className="truncate text-[14px] font-semibold">
          {locale === "en" ? "Composer" : "撰写器"}
        </p>
        <span className="grid size-8 place-items-center rounded-full bg-fg text-surface">
          <Send className="size-3.5" />
        </span>
      </div>
      {extraOpen ? (
        <div className="morph-pop pt-3">
          <div className="mb-2 flex gap-1 text-fg-muted">
            <Bold className="size-3.5" />
            <Italic className="size-3.5" />
            <Link2 className="size-3.5" />
            <List className="size-3.5" />
          </div>
          <p className="text-[12px] leading-relaxed text-fg-subtle">
            {locale === "en" ? "Popped. No 0fr track." : "蹦出来的。没有 0fr 轨道。"}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RadiusRow({ locale }: { locale: Locale }) {
  return (
    <div className="flex h-full items-center gap-3 px-5">
      <span className="flex -space-x-2">
        <i className="size-9 rounded-full bg-accent-soft ring-2 ring-surface" />
        <i className="size-9 rounded-full bg-intent-soft ring-2 ring-surface" />
        <i className="size-9 rounded-full bg-surface-2 ring-2 ring-surface" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold">
          {locale === "en" ? "Design" : "设计组"}
        </p>
        <p className="truncate text-[12px] text-fg-subtle">
          {locale === "en" ? "12 people · hierarchy, not scale" : "12 人 · 层级，不是放大"}
        </p>
      </div>
    </div>
  );
}

function SizeCard({ locale, open, late }: { locale: Locale; open: boolean; late: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-16 flex-1 bg-linear-to-br from-accent-soft to-bg-warm" />
      <div className="shrink-0 px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold">
          {locale === "en" ? "North trail" : "北山路线"}
        </p>
        <p className="truncate text-[11px] text-fg-subtle">
          {locale === "en" ? "12 shots · preview" : "12 张 · 预览"}
        </p>
        <p
          className="morph-late mt-1 text-[11px] leading-relaxed text-fg-muted"
          data-open={open ? "true" : undefined}
          data-sync={late ? undefined : "true"}
        >
          {locale === "en"
            ? "Hierarchy unchanged. The card grows down-right."
            : "层级不变。卡片往右下长。"}
        </p>
      </div>
    </div>
  );
}

function SizeCardNaive({ locale, open }: { locale: Locale; open: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-16 flex-1 bg-linear-to-br from-wrong-soft to-bg-warm" />
      <div className="shrink-0 px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold">
          {locale === "en" ? "North trail" : "北山路线"}
        </p>
        <p className="text-[11px] text-fg-subtle">
          {open
            ? locale === "en"
              ? "Scaled from the middle. Corners went with it."
              : "从中间放大。圆角也跟着变。"
            : locale === "en"
              ? "12 shots · preview"
              : "12 张 · 预览"}
        </p>
      </div>
    </div>
  );
}

function ReflowCard({ locale, open }: { locale: Locale; open: boolean }) {
  return (
    <div className="morph-reflow h-full min-h-0 p-3" data-open={open ? "true" : undefined}>
      <div className="grid place-items-center rounded-xl bg-accent-soft text-accent">
        <User className="size-8" />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">{locale === "en" ? "Lin Yu" : "林予"}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Same nodes. Stack becomes two columns."
            : "同一组节点。单列变成两列。"}
        </p>
      </div>
      <div className="flex items-end gap-2 text-[11px] font-medium text-accent">
        <span>{locale === "en" ? "Message" : "发消息"}</span>
        <span className="text-fg-subtle">{locale === "en" ? "Profile" : "资料"}</span>
      </div>
    </div>
  );
}

function ReflowCardNaive({ locale, open }: { locale: Locale; open: boolean }) {
  if (!open) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3 p-3">
        <div className="grid h-24 place-items-center rounded-xl bg-accent-soft text-accent">
          <User className="size-8" />
        </div>
        <p className="text-[14px] font-semibold">{locale === "en" ? "Lin Yu" : "林予"}</p>
        <p className="text-[12px] text-fg-muted">
          {locale === "en" ? "A profile card." : "一张资料卡。"}
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full items-center gap-4 px-4">
      <div className="grid size-16 shrink-0 place-items-center rounded-full bg-wrong-soft text-wrong">
        <Mail className="size-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">
          {locale === "en" ? "Contact card" : "名片"}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Different DOM. That is a cut, not a reflow."
            : "另一套 DOM。这是切画面，不是重排。"}
        </p>
      </div>
    </div>
  );
}

function ReverseCard({
  locale,
  step,
  contentOut,
}: {
  locale: Locale;
  step: ReverseStage;
  contentOut: boolean;
}) {
  const showTitle = step <= 1;
  const showBody = step === 0 && !contentOut;
  return (
    <div className="flex h-full min-h-0 flex-col bg-fg text-surface">
      <div
        className={cn(
          "flex shrink-0 items-center",
          step === 2 ? "size-full justify-center" : "h-14 gap-2.5 px-4",
        )}
      >
        <span className="grid size-8 place-items-center rounded-full bg-surface/15">
          <Check className="size-3.5" strokeWidth={2.6} />
        </span>
        {showTitle ? (
          <p className="truncate text-[13px] font-medium">
            {locale === "en" ? "Done" : "已完成"}
          </p>
        ) : null}
      </div>
      {step === 2 ? null : (
        <div
          className="morph-late min-h-0 flex-1 overflow-hidden px-4 pb-3"
          data-open={showBody ? "true" : undefined}
          data-sync="true"
        >
          <p className="text-[13px] leading-relaxed text-surface/75">
            {locale === "en"
              ? "Body leaves first. Then height, then width."
              : "正文先走。再收高度，再收宽度。"}
          </p>
        </div>
      )}
    </div>
  );
}

function ReverseCardNaive({ locale, open }: { locale: Locale; open: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-fg text-surface">
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <span className="grid size-8 place-items-center rounded-full bg-surface/15">
          <Check className="size-3.5" strokeWidth={2.6} />
        </span>
        <p className="truncate text-[13px] font-medium">
          {locale === "en" ? "Done" : "已完成"}
        </p>
      </div>
      <div className="min-h-0 flex-1 px-4 pb-3">
        <p className="text-[13px] leading-relaxed text-surface/75">
          {open
            ? locale === "en"
              ? "The next click fades the whole block."
              : "再点一次，整块淡出卸掉。"
            : locale === "en"
              ? "Gone. The check left with it."
              : "没了。勾也一起走了。"}
        </p>
      </div>
    </div>
  );
}

function useMorphPlay(kind: KindId, locked: FixtureState | undefined, reduced: boolean) {
  const isReverse = reverseOrder(kind);
  const lockedState = locked;
  const initial = lockedState ?? stageState(kind, "");
  const [expanded, setExpanded] = useState(initial === "expanded" || initial === "card");
  const [reverseStep, setReverseStep] = useState<ReverseStage>(
    isReverse ? reverseStage(initial === "pill" ? "pill" : initial === "dot" ? "dot" : "card") : 0,
  );
  const [contentOut, setContentOut] = useState(isReverse && initial !== "card" && initial !== "expanded");
  const [busy, setBusy] = useState(false);
  const gen = useRef(0);

  useEffect(() => {
    if (lockedState === undefined) return;
    if (kind === "reverse") {
      const name = lockedState === "pill" ? "pill" : lockedState === "dot" ? "dot" : "card";
      setReverseStep(reverseStage(name));
      setContentOut(name !== "card");
      setExpanded(name === "card");
      return;
    }
    setExpanded(lockedState === "expanded");
  }, [kind, lockedState]);

  useEffect(() => {
    return () => {
      gen.current += 1;
    };
  }, [kind]);

  function toggle() {
    if (lockedState !== undefined || busy) return;
    if (!isReverse) {
      setExpanded((v) => !v);
      return;
    }
    const ms = morphMs(reduced);
    const id = ++gen.current;
    if (reverseStep === 2) {
      if (ms === 0) {
        setReverseStep(0);
        setContentOut(false);
        setExpanded(true);
        return;
      }
      setBusy(true);
      setReverseStep(1);
      window.setTimeout(() => {
        if (gen.current !== id) return;
        setReverseStep(0);
        window.setTimeout(() => {
          if (gen.current !== id) return;
          setContentOut(false);
          setExpanded(true);
          setBusy(false);
        }, ms);
      }, ms);
      return;
    }
    if (ms === 0) {
      setContentOut(true);
      setReverseStep(2);
      setExpanded(false);
      return;
    }
    setBusy(true);
    setContentOut(true);
    window.setTimeout(() => {
      if (gen.current !== id) return;
      setReverseStep(1);
      window.setTimeout(() => {
        if (gen.current !== id) return;
        setReverseStep(2);
        setExpanded(false);
        setBusy(false);
      }, ms);
    }, ms);
  }

  const fixture: FixtureState = isReverse
    ? reverseName(reverseStep)
    : expanded
      ? "expanded"
      : "collapsed";

  return {
    expanded: isReverse ? reverseStep === 0 && !contentOut : expanded,
    reverseStep,
    contentOut,
    contentOpen: isReverse ? reverseStep === 0 && !contentOut : contentVisible(kind, fixture),
    extraOpen: opensExtra(kind) && expanded,
    box: fixtureBox(kind, fixture),
    busy,
    toggle,
  };
}
