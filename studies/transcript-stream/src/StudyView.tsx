import { useState, useEffect, useRef, useCallback } from "react";
import {
  Fingerprint,
  Radio,
  FileCheck,
  Code2,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";
import type { PhaseId, SpeakerProfile, TurnRecord, StreamingMeetingEvent } from "./lib/types";
import {
  calcSessionMetrics,
  processMeetingEvent,
} from "./lib/machines";
import {
  INITIAL_SPEAKERS,
  STREAM_SCENARIOS,
  FINAL_MINUTES,
  type ScenarioId,
} from "./lib/mock-data";
import { useLocale } from "./lib/site-locale";
import { VoiceprintDrawer } from "./components/VoiceprintDrawer";
import { LiveStage } from "./components/LiveStage";
import { MinutesBoard } from "./components/MinutesBoard";
import "./transcript.css";

export function StudyView() {
  const en = useLocale() === "en";
  const [activePhase, setActivePhase] = useState<PhaseId>("live");
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>(INITIAL_SPEAKERS);
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [eventsLog, setEventsLog] = useState<StreamingMeetingEvent[]>([]);
  const [eventIndex, setEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastEvent, setLastEvent] = useState<StreamingMeetingEvent | null>(null);

  const [scenarioId, setScenarioId] = useState<ScenarioId>("full");
  const currentScenario =
    STREAM_SCENARIOS.find((s) => s.id === scenarioId) ?? STREAM_SCENARIOS[0];
  const activeEvents = currentScenario.events;

  const timerRef = useRef<number | null>(null);

  const stepEvent = useCallback(() => {
    if (eventIndex >= activeEvents.length) {
      setIsPlaying(false);
      return;
    }
    const currentEvent = activeEvents[eventIndex];
    setLastEvent(currentEvent);
    setTurns((prevTurns) => processMeetingEvent(prevTurns, currentEvent));
    setEventsLog((prev) => [...prev, currentEvent]);
    setEventIndex((prev) => prev + 1);

    if (currentEvent.is_final || eventIndex + 1 >= activeEvents.length) {
      setIsPlaying(false);
    }
  }, [eventIndex, activeEvents]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(1000 / speed);
    timerRef.current = window.setInterval(() => {
      stepEvent();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, stepEvent]);

  const handleSelectScenario = (id: ScenarioId) => {
    setIsPlaying(false);
    setScenarioId(id);
    setTurns([]);
    setEventsLog([]);
    setEventIndex(0);
    setLastEvent(null);
  };

  const telemetry = calcSessionMetrics(turns, eventsLog);

  const handleTogglePlay = () => {
    if (eventIndex >= activeEvents.length) {
      setTurns([]);
      setEventsLog([]);
      setEventIndex(0);
      setLastEvent(null);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTurns([]);
    setEventsLog([]);
    setEventIndex(0);
    setLastEvent(null);
  };

  const handleAddSpeaker = (name: string, dept: string) => {
    const newId = speakers.length;
    const colors: Array<"teal" | "emerald" | "amber" | "violet" | "blue" | "rose"> = [
      "teal",
      "emerald",
      "amber",
      "violet",
      "blue",
      "rose",
    ];
    const newProfile: SpeakerProfile = {
      id: newId,
      name,
      title: en ? "Guest" : "参会嘉宾",
      department: dept,
      avatar: name.slice(0, 1),
      samplesCount: 1,
      totalDuration_s: 3.0,
      enrolledAt: new Date().toISOString().slice(0, 10),
      isIdentified: true,
      colorKey: colors[newId % colors.length],
      vectorDim: 192,
    };
    setSpeakers((prev) => [...prev, newProfile]);
  };

  const handleInjectOverlap = () => {
    const mockOverlapEvent: StreamingMeetingEvent = {
      event_type: "delta",
      speaker_id: 1,
      speaker_name: "张三",
      delta_text: en
        ? " [Overlap: local validation must happen right here!]"
        : " [⚡插话重叠: 这里必须同时做局部校验！]",
      timestamp_s: Math.max(14.0, telemetry.elapsed_s + 0.5),
      is_overlap: true,
      overlap_speakers: [0, 2],
      cumulative_text: "",
      step_latency_ms: 1.8,
    };
    setLastEvent(mockOverlapEvent);
    setTurns((prev) => processMeetingEvent(prev, mockOverlapEvent));
    setEventsLog((prev) => [...prev, mockOverlapEvent]);
  };

  return (
    <div className="ts-study-root w-full max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-fg-subtle">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>{en ? "Timeline Scenario:" : "时序测试场景:"}</span>
          </div>
          <div className="p-1 rounded-xl bg-surface-2 flex flex-wrap items-center gap-1 border border-border/60">
            {STREAM_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scenarioId === sc.id
                    ? "bg-surface text-accent shadow-xs border border-border"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                <span>{en ? sc.labelEn : sc.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    scenarioId === sc.id
                      ? "bg-accent/10 text-accent"
                      : "bg-surface text-fg-subtle"
                  }`}
                >
                  {en ? sc.badgeEn : sc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-[11px] text-fg-subtle bg-surface-2 border border-border">
            {en ? currentScenario.descriptionEn : currentScenario.description}
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
            {en ? "In-Browser Sandbox" : "✨ 纯前端独立沙盒"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-surface-2/60 border border-border">
        <button
          type="button"
          onClick={() => setActivePhase("prep")}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePhase === "prep"
              ? "bg-surface text-accent shadow-sm border border-border"
              : "text-fg-muted hover:text-fg hover:bg-surface/50"
          }`}
        >
          <Fingerprint className="w-4 h-4 text-accent" />
          <span>{en ? "1. Voiceprint Drawer" : "1. 会前声纹底库抽屉 (Voiceprint Drawer)"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePhase("live")}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePhase === "live"
              ? "bg-surface text-accent shadow-sm border border-border"
              : "text-fg-muted hover:text-fg hover:bg-surface/50"
          }`}
        >
          <Radio className="w-4 h-4 text-wrong animate-pulse" />
          <span>{en ? "2. Live Transcript Stage" : "2. 会中实时双流主舞台 (Live Stage)"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePhase("summary")}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePhase === "summary"
              ? "bg-surface text-accent shadow-sm border border-border"
              : "text-fg-muted hover:text-fg hover:bg-surface/50"
          }`}
        >
          <FileCheck className="w-4 h-4 text-intent" />
          <span>{en ? "3. Split Minutes Board" : "3. 会后纪要分屏看板 (Minutes Board)"}</span>
        </button>
      </div>

      <div className="transition-all duration-200">
        {activePhase === "prep" && (
          <VoiceprintDrawer
            speakers={speakers}
            onAddSpeaker={handleAddSpeaker}
            isOpen={isDrawerOpen}
            onOpen={() => setIsDrawerOpen(true)}
            onClose={() => setIsDrawerOpen(false)}
            onStartMeeting={() => {
              setActivePhase("live");
              if (!isPlaying && turns.length === 0) {
                setIsPlaying(true);
              }
            }}
          />
        )}

        {activePhase === "live" && (
          <LiveStage
            turns={turns}
            telemetry={telemetry}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStep={stepEvent}
            onReset={handleReset}
            onInjectOverlap={handleInjectOverlap}
            onEndMeeting={() => setActivePhase("summary")}
            speed={speed}
            onChangeSpeed={setSpeed}
            autoScroll={autoScroll}
            onToggleAutoScroll={() => setAutoScroll((v) => !v)}
          />
        )}

        {activePhase === "summary" && (
          <MinutesBoard
            turns={turns.length > 0 ? turns : activeEvents.reduce(processMeetingEvent, [])}
            minutes={FINAL_MINUTES}
            onReturnToLive={() => setActivePhase("live")}
            onResetToPrep={() => {
              handleReset();
              setActivePhase("prep");
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-border">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-fg flex items-center gap-1.5 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-accent" />
              {en ? "Active Frame (StreamingMeetingEvent)" : "当前消费事件体 (StreamingMeetingEvent)"}
            </h3>
            <span className="text-[11px] font-mono text-fg-subtle">
              {en ? "Progress: " : "事件进度: "}
              {eventIndex} / {activeEvents.length}
            </span>
          </div>

          <pre className="p-3.5 rounded-xl bg-surface-2 border border-border font-mono text-[11px] text-fg leading-relaxed overflow-x-auto max-h-56">
            {lastEvent
              ? JSON.stringify(lastEvent, null, 2)
              : en
                ? "// No stream event yet\n// Click [Play Stream] or [Step] above to inspect frames"
                : `// 尚未触发流式事件\n// 点击上方【播放流式事件】或【单步前进一步】观察协议帧`}
          </pre>

          <p className="text-[11px] text-fg-muted flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span>
              {en ? (
                <>
                  The client consumes a unidirectional <code>StreamingMeetingEvent</code> pipeline and advances local turn state from <code>event_type</code>, <code>is_overlap</code>, and <code>just_identified</code>.
                </>
              ) : (
                <>
                  前端挂载单向流式事件管道消费标准 <code>StreamingMeetingEvent</code>，根据 <code>event_type</code>、<code>is_overlap</code> 及 <code>just_identified</code> 局部推进状态机。
                </>
              )}
            </span>
          </p>
        </div>

        <div className="lg:col-span-7 p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-fg flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            {en ? "Three Core Experience Guarantees" : "转录流三大关键体验保障"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
              <span className="font-semibold text-fg block">
                {en ? "1. Smooth Delta Append" : "1. 增量打字平滑吸底"}
              </span>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                {en ? (
                  <>
                    Appending <code>delta</code> in place advances the cursor cleanly without tearing down DOM nodes or jittering scroll.
                  </>
                ) : (
                  <>
                    收到 <code>delta</code> 时就地修改当前话轮文本，游标自然前推，杜绝频繁摧毁与重建 DOM 导致的滚动震荡。
                  </>
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
              <span className="font-semibold text-fg block">
                {en ? "2. Late Speaker Resolution" : "2. 声纹后验无感过渡"}
              </span>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                {en ? (
                  <>
                    Voiceprint sampling takes 2–3s; when <code>just_identified</code> fires, a subtle glow updates the speaker name retroactively.
                  </>
                ) : (
                  <>
                    由于声纹特征需要 2~3 秒声学采样，触发 <code>just_identified</code> 时以专属光晕波纹重命名，历史气泡一并联动。
                  </>
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
              <span className="font-semibold text-fg block">
                {en ? "3. Inline Overlap Alert" : "3. 抢话碰撞行内警示"}
              </span>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                {en ? (
                  <>
                    Simultaneous speech lights up an inline <code>Overlap</code> badge and amber glow without breaking reading flow.
                  </>
                ) : (
                  <>
                    多人同时开口时点亮 <code>⚡重叠</code> 胶囊与琥珀呼吸光，既如实呈现抢话事实，又不阻断阅读与后续纪要生成。
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs text-fg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-accent block mb-0.5">
                {en ? "Framework-Free State Reducer" : "无框架依赖的状态归约器设计"}
              </strong>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                {en ? (
                  <>
                    All stream reduction lives in pure functions inside <code>machines.ts</code>, decoupled from React and DOM so the same logic ports directly to web, mobile, or desktop clients.
                  </>
                ) : (
                  <>
                    状态处理逻辑完全收敛在纯函数 <code>machines.ts</code> 中，解耦了 React 与 DOM。不仅可在 Web 端渲染，亦可直接复用于 React Native、Electron 桌面客户端或跨端组件，实现设计理念与核心逻辑的高效参考与移植。
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
