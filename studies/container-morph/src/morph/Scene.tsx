import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Bold, Check, Italic, Link2, List, Mail, Search, Send, User } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import {
  contentAfterContainer,
  contentVisible,
  fixtureBox,
  morphAnchor,
  morphAxis,
  morphMs,
  opensExtra,
  reverseBeat,
  reverseName,
  reverseOrder,
  reverseStage,
  sameNodes,
  stageState,
  type FixtureState,
  type MorphBox,
  type ReverseStage,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import { DemoShell } from "./Frame";
import "./morph.css";

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
  const box = live.box;
  const axis = morphAxis(id);
  const anchor = morphAnchor(id);
  const duration = morphMs(reduced);
  const beat =
    id === "reverse"
      ? live.reverseStep === 0 && !live.contentOut
        ? reverseName(0)
        : reverseBeat(live.reverseStep === 0 ? 0 : live.reverseStep)
      : null;

  function onToggle() {
    if (locked) return;
    live.toggle();
  }

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
            {locale === "en"
              ? "Click the container. Watch which axis moves."
              : "点容器。看宽、高、圆角、排版哪根在动。"}
          </p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-fg-subtle">
          {box.width}×{box.height} · r{box.radius}
        </p>
      </div>

      <div className="morph-stage" data-anchor={anchor}>
        <MorphFrame
          kind={id}
          box={box}
          reduced={reduced}
          locked={locked}
          expanded={live.expanded}
          duration={duration}
          onToggle={onToggle}
          label={pick(meta.zh, locale)}
        >
          <KindFace
            id={id}
            locale={locale}
            expanded={live.expanded}
            contentOpen={live.contentOpen}
            extraOpen={live.extraOpen}
            reverseStep={live.reverseStep}
            contentOut={live.contentOut}
          />
        </MorphFrame>
      </div>

      <p className="px-4 pb-3 font-mono text-[11px] tabular-nums text-fg-subtle sm:px-5">
        {axis}
        {anchor !== "none" ? ` · ${anchor}` : ""}
        {beat ? ` · ${beat}` : ""}
        {opensExtra(id) ? " · 0fr→1fr" : ""}
        {sameNodes(id) ? (locale === "en" ? " · same nodes" : " · 同一组节点") : ""}
      </p>

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

function MorphFrame({
  kind,
  box,
  reduced,
  locked,
  expanded,
  duration,
  onToggle,
  label,
  children,
}: {
  kind: KindId;
  box: MorphBox;
  reduced: boolean;
  locked: boolean;
  expanded: boolean;
  duration: number;
  onToggle: () => void;
  label: string;
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
  expanded,
  contentOpen,
  extraOpen,
  reverseStep,
  contentOut,
}: {
  id: KindId;
  locale: Locale;
  expanded: boolean;
  contentOpen: boolean;
  extraOpen: boolean;
  reverseStep: ReverseStage;
  contentOut: boolean;
}) {
  const late = contentAfterContainer(id);
  switch (id) {
    case "circle-pill":
      return <CirclePill locale={locale} open={contentOpen} />;
    case "pill-card":
      return <PillCard locale={locale} open={contentOpen} late={late} />;
    case "compact":
      return <CompactBar locale={locale} extraOpen={extraOpen} late={late} />;
    case "radius":
      return <RadiusRow locale={locale} />;
    case "size":
      return <SizeCard locale={locale} open={contentOpen} late={late} />;
    case "reflow":
      return <ReflowCard locale={locale} open={expanded} />;
    case "reverse":
      return <ReverseCard locale={locale} step={reverseStep} contentOut={contentOut} />;
  }
}

function CirclePill({ locale, open }: { locale: Locale; open: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full items-center bg-fg text-surface",
        open ? "gap-2.5 px-3.5" : "justify-center",
      )}
    >
      <Search className="size-4 shrink-0" strokeWidth={2.2} />
      <span
        className={cn(
          "truncate text-[13px] font-medium",
          open ? "min-w-0 flex-1 opacity-100" : "w-0 overflow-hidden opacity-0",
        )}
      >
        {locale === "en" ? "Search files" : "搜索文件"}
      </span>
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
    toggle,
  };
}
