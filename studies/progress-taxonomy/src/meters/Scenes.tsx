import type { ReactNode } from "react";
import { KINDS } from "../lib/kinds";
import { clampProgress, type KindId } from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { Window } from "./Frame";
import {
  AudioWave,
  BounceDots,
  CircularPercent,
  FillBar,
  LiquidGauge,
  LoopSpinner,
  RadarScan,
  StageSteps,
} from "./Meters";

export function Scene({
  id,
  progress,
  looping,
  wave,
  locale,
  action,
}: {
  id: KindId;
  progress: number;
  looping: boolean;
  wave?: boolean;
  locale: Locale;
  action?: ReactNode;
}) {
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0];
  const title = pick(meta.window, locale);

  switch (id) {
    case "fill":
      return (
        <Window title={title} action={action}>
          <UploadBody progress={progress} locale={locale} />
        </Window>
      );
    case "steps":
      return (
        <Window title={title} action={action}>
          <p className="text-[15px] font-semibold">{pick(meta.headline, locale)}</p>
          <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.sub, locale)}</p>
          <StageSteps progress={progress} locale={locale} className="mt-6" />
        </Window>
      );
    case "circular":
      return (
        <Window title={title} action={action}>
          <GaugeBody
            label={pick(meta.headline, locale)}
            hint={pick(meta.sub, locale)}
            progress={progress}
          />
        </Window>
      );
    case "liquid":
      return (
        <Window title={title} action={action}>
          <div className="flex flex-col items-center gap-4 py-1">
            <LiquidGauge progress={progress} wave={wave} />
            <div className="text-center">
              <p className="text-[15px] font-semibold">{pick(meta.headline, locale)}</p>
              <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.sub, locale)}</p>
            </div>
          </div>
        </Window>
      );
    case "spin":
      return (
        <Window title={title} action={action}>
          <div className="flex flex-col items-center gap-4 py-3">
            <LoopSpinner looping={looping} />
            <div className="text-center">
              <p className="text-[15px] font-semibold">
                {looping
                  ? pick(meta.headline, locale)
                  : locale === "en"
                    ? "Synced"
                    : "已同步"}
              </p>
              <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.sub, locale)}</p>
            </div>
          </div>
        </Window>
      );
    case "radar":
      return (
        <Window title={title} action={action}>
          <div className="flex flex-col items-center gap-4 py-1">
            <RadarScan looping={looping} />
            <div className="text-center">
              <p className="text-[15px] font-semibold">{pick(meta.headline, locale)}</p>
              <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.sub, locale)}</p>
            </div>
          </div>
        </Window>
      );
    case "dots":
      return (
        <Window title={title} action={action}>
          <ChatBody looping={looping} locale={locale} />
        </Window>
      );
    case "wave":
      return (
        <Window title={title} action={action}>
          <VoiceBody looping={looping} locale={locale} />
        </Window>
      );
  }
}

function UploadBody({ progress, locale }: { progress: number; locale: Locale }) {
  const p = clampProgress(progress);
  const pct = Math.round(p * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] font-semibold">
          {locale === "en" ? "Uploading" : "文件上传"}
        </p>
        <p className="shrink-0 font-medium tabular-nums text-accent">{pct}%</p>
      </div>
      <p className="mt-1 text-[13px] text-fg-muted">brief.pdf · 12.4 MB</p>
      <FillBar progress={progress} className="mt-4" />
    </div>
  );
}

function GaugeBody({
  label,
  hint,
  progress,
}: {
  label: string;
  hint: string;
  progress: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-1">
      <CircularPercent progress={progress} />
      <div className="text-center">
        <p className="text-[15px] font-semibold">{label}</p>
        <p className="mt-1 text-[13px] text-fg-muted">{hint}</p>
      </div>
    </div>
  );
}

function ChatBody({ looping, locale }: { looping: boolean; locale: Locale }) {
  return (
    <div className="space-y-3">
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface-2 px-3 py-2 text-[13px] leading-relaxed">
        {locale === "en"
          ? "Second draft is in. Check the structure?"
          : "方案第二稿发你了，看下结构。"}
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-2xl rounded-tl-md bg-accent-soft px-3.5 py-2.5">
          <BounceDots looping={looping} />
        </div>
        <p className="text-[12px] text-fg-subtle">
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

function VoiceBody({ looping, locale }: { looping: boolean; locale: Locale }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 px-4 py-4">
      <AudioWave looping={looping} />
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
