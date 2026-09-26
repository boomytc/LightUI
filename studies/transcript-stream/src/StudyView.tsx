import { useState, useEffect, useRef, useCallback } from "react";
import {
  Fingerprint,
  Radio,
  FileCheck,
  Code2,
  AlertTriangle,
  Sparkles,
  Info,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { PhaseId, SpeakerProfile, TurnRecord, StreamingMeetingEvent } from "./lib/types";
import {
  calcSessionMetrics,
  processMeetingEvent,
} from "./lib/machines";
import { INITIAL_SPEAKERS, SIMULATED_EVENTS, FINAL_MINUTES } from "./lib/mock-data";
import { VoiceprintDrawer } from "./components/VoiceprintDrawer";
import { LiveStage } from "./components/LiveStage";
import { MinutesBoard } from "./components/MinutesBoard";

export function StudyView() {
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

  // Live LightASR WebSocket Bridge Mode
  const [streamSource, setStreamSource] = useState<"simulated" | "websocket">("simulated");
  const [wsUrl, setWsUrl] = useState("ws://127.0.0.1:8765/ws");
  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  );
  const wsRef = useRef<WebSocket | null>(null);

  const timerRef = useRef<number | null>(null);

  // Advance single simulated event
  const stepEvent = useCallback(() => {
    if (eventIndex >= SIMULATED_EVENTS.length) {
      setIsPlaying(false);
      return;
    }
    const currentEvent = SIMULATED_EVENTS[eventIndex];
    setLastEvent(currentEvent);
    setTurns((prevTurns) => processMeetingEvent(prevTurns, currentEvent));
    setEventsLog((prev) => [...prev, currentEvent]);
    setEventIndex((prev) => prev + 1);

    // If final event, pause
    if (currentEvent.is_final || eventIndex + 1 >= SIMULATED_EVENTS.length) {
      setIsPlaying(false);
    }
  }, [eventIndex]);

  // Playback timer for simulated stream
  useEffect(() => {
    if (streamSource !== "simulated" || !isPlaying) {
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
  }, [isPlaying, speed, stepEvent, streamSource]);

  // WebSocket Live Connection Handler
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setWsStatus("connecting");
    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsStatus("connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as StreamingMeetingEvent;
          setLastEvent(payload);
          setTurns((prev) => processMeetingEvent(prev, payload));
          setEventsLog((prev) => [...prev, payload]);
        } catch {
          // ignore non-json ping/pong frames
        }
      };

      socket.onerror = () => {
        setWsStatus("error");
      };

      socket.onclose = () => {
        setWsStatus("disconnected");
        wsRef.current = null;
      };
    } catch {
      setWsStatus("error");
    }
  }, [wsUrl]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsStatus("disconnected");
  }, []);

  // Cleanup websocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Compute telemetry live
  const telemetry = calcSessionMetrics(turns, eventsLog);

  const handleTogglePlay = () => {
    if (eventIndex >= SIMULATED_EVENTS.length) {
      // Reached the end, reset first
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
      title: "参会嘉宾",
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
      delta_text: " [⚡插话重叠: 这里必须同时做局部校验！]",
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
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Top Mode & Phase Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-xs">
        {/* Source Switcher: Simulated vs Live WebSocket */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-fg-subtle">数据源模式:</span>
          <div className="p-1 rounded-xl bg-surface-2 flex items-center gap-1 border border-border/60">
            <button
              type="button"
              onClick={() => {
                disconnectWebSocket();
                setStreamSource("simulated");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                streamSource === "simulated"
                  ? "bg-surface text-accent shadow-xs border border-border"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              内置仿真流回放
            </button>
            <button
              type="button"
              onClick={() => setStreamSource("websocket")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                streamSource === "websocket"
                  ? "bg-surface text-accent shadow-xs border border-border"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              LightASR 真实 WebSocket 联调
            </button>
          </div>
        </div>

        {/* WebSocket Connection Toolbar if active */}
        {streamSource === "websocket" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono w-52 focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="ws://127.0.0.1:8765/ws"
            />
            {wsStatus === "connected" ? (
              <button
                type="button"
                onClick={disconnectWebSocket}
                className="px-3 py-1.5 bg-wrong/10 text-wrong border border-wrong/30 rounded-lg font-medium cursor-pointer flex items-center gap-1"
              >
                <WifiOff className="w-3.5 h-3.5" />
                断开
              </button>
            ) : (
              <button
                type="button"
                onClick={connectWebSocket}
                className="px-3 py-1.5 bg-accent text-white rounded-lg font-semibold cursor-pointer hover:bg-accent/90 flex items-center gap-1"
              >
                <Wifi className="w-3.5 h-3.5" />
                {wsStatus === "connecting" ? "连接中..." : "连接服务"}
              </button>
            )}
            <span
              className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                wsStatus === "connected"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : wsStatus === "connecting"
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : wsStatus === "error"
                      ? "bg-rose-50 text-rose-700 border-rose-300"
                      : "bg-surface text-fg-subtle border-border"
              }`}
            >
              {wsStatus === "connected"
                ? "🟢 已连接"
                : wsStatus === "connecting"
                  ? "🟡 连接中"
                  : wsStatus === "error"
                    ? "🔴 连接失败"
                    : "⚪ 未连接"}
            </span>
          </div>
        )}
      </div>

      {/* 2. Three-Phase Pipeline Stepper */}
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
          <span>1. 会前声纹底库抽屉 (Voiceprint Drawer)</span>
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
          <span>2. 会中实时双流主舞台 (Live Stage)</span>
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
          <span>3. 会后纪要分屏看板 (Minutes Board)</span>
        </button>
      </div>

      {/* 3. Main Stage Content for Current Phase */}
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
            turns={turns.length > 0 ? turns : SIMULATED_EVENTS.map((e, idx) => ({
              turn_id: `turn_${idx}`,
              speaker_id: e.speaker_id,
              speaker_name: e.speaker_name,
              start_s: e.timestamp_s,
              end_s: e.timestamp_s + 2.0,
              text: e.delta_text,
              has_overlap: e.is_overlap,
              overlap_speakers: e.overlap_speakers,
              is_active: false,
            }))}
            minutes={FINAL_MINUTES}
            onReturnToLive={() => setActivePhase("live")}
            onResetToPrep={() => {
              handleReset();
              setActivePhase("prep");
            }}
          />
        )}
      </div>

      {/* 4. Live Protocol Event Inspector & Architecture Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-border">
        {/* Left: Active Event Stream Inspector */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-fg flex items-center gap-1.5 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-accent" />
              当前消费事件体 (StreamingMeetingEvent)
            </h3>
            <span className="text-[11px] font-mono text-fg-subtle">
              {streamSource === "simulated"
                ? `模拟进度: ${eventIndex} / ${SIMULATED_EVENTS.length}`
                : `WS 消息: ${eventsLog.length} 条`}
            </span>
          </div>

          <pre className="p-3.5 rounded-xl bg-surface-2 border border-border font-mono text-[11px] text-fg leading-relaxed overflow-x-auto max-h-56">
            {lastEvent
              ? JSON.stringify(lastEvent, null, 2)
              : `// 尚未触发流式事件\n// 点击上方【播放流式事件】或连接 WebSocket 观察协议帧`}
          </pre>

          <p className="text-[11px] text-fg-muted flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span>
              前端挂载单向 WebSocket/SSE 管道消费 LightASR 输出的 <code>StreamingMeetingEvent</code>，根据 <code>event_type</code>、<code>is_overlap</code> 及 <code>just_identified</code> 局部推进状态机。
            </span>
          </p>
        </div>

        {/* Right: Technical Insights & Failure Modes */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-fg flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            转录流三大关键体验保障
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
              <span className="font-semibold text-fg block">1. 增量打字平滑吸底</span>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                收到 <code>delta</code> 时就地修改当前话轮文本，游标自然前推，杜绝频繁摧毁与重建 DOM 导致的滚动震荡。
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
              <span className="font-semibold text-fg block">2. 声纹后验无感过渡</span>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                由于声纹特征需要 2~3 秒声学采样，触发 <code>just_identified</code> 时以专属光晕波纹重命名，历史气泡一并联动。
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
              <span className="font-semibold text-fg block">3. 抢话碰撞行内警示</span>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                多人同时开口时点亮 <code>⚡重叠</code> 胶囊与琥珀呼吸光，既如实呈现抢话事实，又不阻断阅读与后续纪要生成。
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-wrong/5 border border-wrong/20 text-xs text-fg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-wrong shrink-0 mt-0.5" />
            <div>
              <strong className="text-wrong block mb-0.5">反哺 LightASR 架构指引</strong>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                在 <code>LightASR/products/meeting_minutes/realtime_pipeline.py</code> 中由 <code>StreamingMeetingEvent</code> 提供标准数据流输出，前端只需复用 <code>machines.ts</code> 即可实现零重构移植。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
