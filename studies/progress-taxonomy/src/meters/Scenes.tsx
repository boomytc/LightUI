import type { ReactNode } from "react";
import { KINDS } from "../lib/kinds";
import { clampProgress, type KindId } from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { Pane, Window } from "./Frame";
import {
  AudioWave,
  BounceDots,
  CircularPercent,
  FillBar,
  LiquidGauge,
  LoopSpinner,
  RadarScan,
  StageSteps,
  type MeterScale,
} from "./Meters";

export function Scene({
  id,
  progress,
  looping,
  wave,
  locale,
  action,
  scale = "compact",
}: {
  id: KindId;
  progress: number;
  looping: boolean;
  wave?: boolean;
  locale: Locale;
  action?: ReactNode;
  scale?: MeterScale;
}) {
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0];
  const title = pick(meta.window, locale);
  const headline = pick(meta.headline, locale);
  const sub = pick(meta.sub, locale);

  switch (id) {
    case "fill":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <UploadBody progress={progress} locale={locale} scale={scale} />
        </Shell>
      );
    case "steps":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <CopyBlock headline={headline} sub={sub} scale={scale} />
          <StageSteps progress={progress} locale={locale} scale={scale} className={scale === "hero" ? "mt-10" : "mt-6"} />
        </Shell>
      );
    case "circular":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <GaugeStack scale={scale} headline={headline} sub={sub}>
            <CircularPercent progress={progress} scale={scale} />
          </GaugeStack>
        </Shell>
      );
    case "liquid":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <GaugeStack scale={scale} headline={headline} sub={sub}>
            <LiquidGauge progress={progress} wave={wave} scale={scale} />
          </GaugeStack>
        </Shell>
      );
    case "spin":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <GaugeStack
            scale={scale}
            headline={looping ? headline : locale === "en" ? "Synced" : "已同步"}
            sub={sub}
          >
            <LoopSpinner looping={looping} scale={scale} />
          </GaugeStack>
        </Shell>
      );
    case "radar":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <GaugeStack scale={scale} headline={headline} sub={sub}>
            <RadarScan looping={looping} scale={scale} />
          </GaugeStack>
        </Shell>
      );
    case "dots":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <ChatBody looping={looping} locale={locale} scale={scale} />
        </Shell>
      );
    case "wave":
      return (
        <Shell scale={scale} title={title} action={action} demo={id}>
          <VoiceBody looping={looping} locale={locale} scale={scale} />
        </Shell>
      );
  }
}

function Shell({
  scale,
  title,
  action,
  demo,
  children,
}: {
  scale: MeterScale;
  title: string;
  action?: ReactNode;
  demo: KindId;
  children: ReactNode;
}) {
  if (scale === "compact") {
    return (
      <Window title={title} action={action}>
        {children}
      </Window>
    );
  }
  return (
    <Pane>
      <div data-demo={demo} className="min-w-0">
        {children}
        {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
      </div>
    </Pane>
  );
}

function GaugeStack({
  scale,
  headline,
  sub,
  children,
}: {
  scale: MeterScale;
  headline: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className={scale === "hero" ? "flex flex-col items-center gap-6" : "flex flex-col items-center gap-4 py-1"}>
      {children}
      <CopyBlock headline={headline} sub={sub} scale={scale} align="center" />
    </div>
  );
}

function CopyBlock({
  headline,
  sub,
  scale,
  align = "left",
}: {
  headline: string;
  sub: string;
  scale: MeterScale;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : undefined}>
      <p className={scale === "hero" ? "text-[1.15rem] font-semibold" : "text-[15px] font-semibold"}>{headline}</p>
      <p className={scale === "hero" ? "mt-1.5 text-[14px] text-fg-muted" : "mt-1 text-[13px] text-fg-muted"}>{sub}</p>
    </div>
  );
}

function UploadBody({
  progress,
  locale,
  scale,
}: {
  progress: number;
  locale: Locale;
  scale: MeterScale;
}) {
  const p = clampProgress(progress);
  const pct = Math.round(p * 100);
  const hero = scale === "hero";
  return (
    <div className={hero ? "w-full" : undefined}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={hero ? "min-w-0 truncate text-[1.15rem] font-semibold" : "min-w-0 truncate text-[15px] font-semibold"}>
          {locale === "en" ? "Uploading" : "文件上传"}
        </p>
        <p className={hero ? "shrink-0 text-3xl font-medium tabular-nums text-accent lg:text-4xl" : "shrink-0 font-medium tabular-nums text-accent"}>
          {pct}%
        </p>
      </div>
      <p className={hero ? "mt-1.5 text-[14px] text-fg-muted" : "mt-1 text-[13px] text-fg-muted"}>brief.pdf · 12.4 MB</p>
      <FillBar progress={progress} scale={scale} className={hero ? "mt-8" : "mt-4"} />
    </div>
  );
}

function ChatBody({
  looping,
  locale,
  scale,
}: {
  looping: boolean;
  locale: Locale;
  scale: MeterScale;
}) {
  const hero = scale === "hero";
  return (
    <div className={hero ? "mx-auto w-full max-w-lg space-y-5" : "space-y-3"}>
      <div
        className={
          hero
            ? "max-w-[28rem] rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3 text-[15px] leading-relaxed"
            : "max-w-[85%] rounded-2xl rounded-tl-md bg-surface-2 px-3 py-2 text-[13px] leading-relaxed"
        }
      >
        {locale === "en" ? "Second draft is in. Check the structure?" : "方案第二稿发你了，看下结构。"}
      </div>
      <div className="flex items-center gap-3">
        <div className={hero ? "rounded-2xl rounded-tl-md bg-accent-soft px-5 py-4" : "rounded-2xl rounded-tl-md bg-accent-soft px-3.5 py-2.5"}>
          <BounceDots looping={looping} scale={scale} />
        </div>
        <p className={hero ? "text-[14px] text-fg-subtle" : "text-[12px] text-fg-subtle"}>
          {looping
            ? locale === "en"
              ? "They are typing"
              : "对方正在回复"
            : locale === "en"
              ? "Idle"
              : "已停下"}
        </p>
      </div>
    </div>
  );
}

function VoiceBody({
  looping,
  locale,
  scale,
}: {
  looping: boolean;
  locale: Locale;
  scale: MeterScale;
}) {
  const hero = scale === "hero";
  if (hero) {
    return (
      <div className="flex flex-col items-center gap-6">
        <AudioWave looping={looping} scale={scale} />
        <CopyBlock
          headline={looping ? (locale === "en" ? "Listening to speech" : "正在识别语音") : locale === "en" ? "Stopped" : "已停止"}
          sub={locale === "en" ? "A moving wave means the voice is heard" : "波形在变 = 声音在被听见"}
          scale={scale}
          align="center"
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 px-4 py-4">
      <AudioWave looping={looping} scale={scale} />
      <div className="min-w-0">
        <p className="text-[15px] font-semibold">
          {looping
            ? locale === "en"
              ? "Listening to speech"
              : "正在识别语音"
            : locale === "en"
              ? "Stopped"
              : "已停止"}
        </p>
        <p className="mt-1 text-[13px] text-fg-muted">
          {locale === "en" ? "A moving wave means the voice is heard" : "波形在变 = 声音在被听见"}
        </p>
      </div>
    </div>
  );
}
