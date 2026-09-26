import { useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle,
  Activity,
  Layers,
  Sparkles,
  ArrowDown,
  Volume2,
} from "lucide-react";
import type { MeetingSessionTelemetry, TurnRecord } from "../lib/types";
import { formatTimestamp, formatTimestampFull, getSpeakerTheme } from "../lib/machines";

interface LiveStageProps {
  turns: TurnRecord[];
  telemetry: MeetingSessionTelemetry;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onInjectOverlap: () => void;
  onEndMeeting: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
}

export function LiveStage({
  turns,
  telemetry,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  onInjectOverlap,
  onEndMeeting,
  speed,
  onChangeSpeed,
  autoScroll,
  onToggleAutoScroll,
}: LiveStageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new text arrives
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [turns, autoScroll]);

  return (
    <div className="w-full flex flex-col h-[680px] bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      {/* 1. Top Telemetry & Audio Visualizer Bar */}
      <div className="px-5 py-3.5 border-b border-border bg-surface-2/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4">
          {/* Live Recording Indicator & Elapsed Time */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wrong opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? "bg-wrong" : "bg-fg-subtle"}`}
              />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-fg">
                {formatTimestamp(telemetry.elapsed_s)}
              </span>
              <span className="text-[10px] text-fg-subtle">
                {isPlaying ? "实时会议进行中" : "流式就绪 / 暂停"}
              </span>
            </div>
          </div>

          {/* Audio Visualizer (Waveform Amplitude Bars) */}
          <div className="hidden sm:flex items-center gap-0.5 px-3 py-1.5 rounded-lg bg-surface border border-border">
            <Volume2 className="w-3.5 h-3.5 text-accent mr-1 shrink-0" />
            {[40, 75, 90, 60, 85, 100, 70, 50, 80, 95, 65, 45, 80, 70, 55, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-accent/80 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(4, (h * ((i % 3) + 1)) % 22)}px` : "4px",
                  opacity: isPlaying ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Key Metrics Chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-surface border border-border text-fg-muted font-medium flex items-center gap-1">
              <Activity className="w-3 h-3 text-accent" />
              <span>
                延迟 <strong className="text-fg font-mono">{telemetry.avgLatencyMs}ms</strong>
              </span>
            </span>
            <span className="px-2 py-1 rounded-md bg-surface border border-border text-fg-muted font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-intent" />
              <span>
                字数 <strong className="text-fg font-mono">{telemetry.totalChars}</strong>
              </span>
            </span>
            <span className="px-2 py-1 rounded-md bg-surface border border-border text-fg-muted font-medium hidden md:flex items-center gap-1">
              <span>
                RTF <strong className="text-fg font-mono">{telemetry.rtf}</strong>
              </span>
            </span>
            {telemetry.overlapCount > 0 && (
              <span className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1 animate-pulse">
                <Zap className="w-3 h-3" />
                <span>
                  重叠碰撞 <strong className="font-mono">{telemetry.overlapCount}</strong> 次
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right Action: End Meeting */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEndMeeting}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-wrong hover:bg-wrong/90 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            结束会议并生成纪要
          </button>
        </div>
      </div>

      {/* 2. Interactive Stream Control Toolbar */}
      <div className="px-5 py-2 border-b border-border/80 bg-surface flex flex-wrap items-center justify-between text-xs text-fg-muted gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlaying
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-surface-2 border-border hover:bg-surface-2/80 text-fg"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "暂停流式事件" : "播放流式事件"}
          </button>

          <button
            type="button"
            onClick={onStep}
            className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface-2 text-fg transition-colors cursor-pointer"
            title="手动触发单步 ASR 增量分块"
          >
            单步步进
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface-2 text-fg-muted hover:text-fg transition-colors flex items-center gap-1 cursor-pointer"
            title="清空当前转录流重播"
          >
            <RotateCcw className="w-3 h-3" />
            重置
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Speed Selector */}
          <div className="flex items-center gap-1">
            <span>倍速:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer ${
                  speed === s
                    ? "bg-accent text-white font-bold"
                    : "bg-surface-2 text-fg-muted hover:text-fg"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            type="button"
            onClick={onInjectOverlap}
            className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            注入抢话重叠
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-fg-subtle hover:text-fg select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={onToggleAutoScroll}
              className="rounded border-border text-accent focus:ring-accent"
            />
            <span>自动吸底跟随</span>
            <ArrowDown className="w-3 h-3" />
          </label>
        </div>
      </div>

      {/* 3. Main Multi-Speaker Typewriter Dialogue Bubbles */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-warm/30 scroll-smooth"
      >
        {turns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-semibold text-fg">转录流主舞台就绪</p>
              <p className="text-xs text-fg-muted mt-1 max-w-sm">
                点击上方【播放流式事件】或【单步步进】，即可体验多说话人打字机追加、声纹后验认人换名与抢话呼吸动效。
              </p>
            </div>
          </div>
        ) : (
          turns.map((turn, index) => {
            const theme = getSpeakerTheme(turn.speaker_id);
            const isOverlap = turn.has_overlap;

            return (
              <div
                key={turn.turn_id || index}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isOverlap
                    ? "border-amber-400 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-300 dark:ring-amber-700"
                    : `${theme.bubbleBorder} ${theme.bubbleBg}`
                } ${turn.just_identified ? "animate-resolve-glow" : ""}`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Speaker Avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {turn.speaker_name.slice(0, 1)}
                    </div>

                    {/* Speaker Name with Just-Identified Transition */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold transition-colors duration-500 ${
                          turn.just_identified ? "text-accent font-bold" : "text-fg"
                        }`}
                      >
                        {turn.speaker_name}
                      </span>

                      {turn.just_identified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20 animate-fade-in">
                          <Sparkles className="w-2.5 h-2.5" />
                          声纹认人成功
                          {turn.similarity ? ` (${turn.similarity.toFixed(2)})` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Physical Timestamps & Overlap Badges */}
                  <div className="flex items-center gap-2 text-xs">
                    {isOverlap && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-wrong text-white shadow-xs animate-pulse">
                        <Zap className="w-3 h-3 fill-white" />
                        ⚡重叠
                      </span>
                    )}
                    <span className="font-mono text-fg-subtle text-[11px] px-1.5 py-0.5 rounded bg-surface border border-border">
                      {formatTimestampFull(turn.start_s)} - {formatTimestampFull(turn.end_s)}
                    </span>
                  </div>
                </div>

                {/* Turn Text Body with Typewriter Cursor */}
                <div className="text-sm leading-relaxed text-fg whitespace-pre-wrap font-sans pl-9">
                  {turn.text}
                  {turn.is_active && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-accent align-middle animate-cursor-blink" />
                  )}
                </div>

                {/* Overlap Footer Detail if active */}
                {isOverlap && turn.overlap_speakers.length > 0 && (
                  <div className="mt-2.5 pl-9 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 shrink-0" />
                    <span>
                      同时检测到 <strong>Speaker {turn.overlap_speakers.join(", ")}</strong>{" "}
                      声学重叠开口发言
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Protocol Strip */}
      <div className="px-5 py-2.5 border-t border-border bg-surface text-[11px] text-fg-subtle flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-intent inline-block" />
          StreamingMeetingEvent (Sortformer 100M Diarization + Confucius4-R2T2 LSP)
        </span>
        <span className="text-fg-muted">
          单步特征耗时: ~1.6ms · 显存常驻: 3.1GB · 零全量重绘
        </span>
      </div>
    </div>
  );
}
