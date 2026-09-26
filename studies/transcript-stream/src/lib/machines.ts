import type {
  MeetingSessionTelemetry,
  PhaseId,
  SpeakerMetric,
  SpeakerProfile,
  StreamingMeetingEvent,
  TurnRecord,
} from "./types";

export const KIND_IDS: readonly PhaseId[] = ["live", "prep", "summary"];

export function isKindId(value: string): value is PhaseId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export interface SpeakerTheme {
  primary: string;
  badgeBg: string;
  badgeText: string;
  bubbleBg: string;
  bubbleBorder: string;
  glowBorder: string;
  dotColor: string;
}

export const SPEAKER_THEMES: SpeakerTheme[] = [
  // Speaker 0: Teal
  {
    primary: "#0d9488",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40",
    badgeText: "text-teal-700 dark:text-teal-300",
    bubbleBg: "bg-teal-50/40 dark:bg-teal-950/20",
    bubbleBorder: "border-teal-200 dark:border-teal-800/60",
    glowBorder: "border-teal-400 dark:border-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.3)]",
    dotColor: "bg-teal-500",
  },
  // Speaker 1: Emerald
  {
    primary: "#059669",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    bubbleBg: "bg-emerald-50/40 dark:bg-emerald-950/20",
    bubbleBorder: "border-emerald-200 dark:border-emerald-800/60",
    glowBorder: "border-emerald-400 dark:border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
    dotColor: "bg-emerald-500",
  },
  // Speaker 2: Amber
  {
    primary: "#d97706",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    bubbleBg: "bg-amber-50/40 dark:bg-amber-950/20",
    bubbleBorder: "border-amber-200 dark:border-amber-800/60",
    glowBorder: "border-amber-400 dark:border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    dotColor: "bg-amber-500",
  },
  // Speaker 3: Violet
  {
    primary: "#7c3aed",
    badgeBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    bubbleBg: "bg-violet-50/40 dark:bg-violet-950/20",
    bubbleBorder: "border-violet-200 dark:border-violet-800/60",
    glowBorder: "border-violet-400 dark:border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]",
    dotColor: "bg-violet-500",
  },
  // Speaker 4: Blue
  {
    primary: "#2563eb",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    bubbleBg: "bg-blue-50/40 dark:bg-blue-950/20",
    bubbleBorder: "border-blue-200 dark:border-blue-800/60",
    glowBorder: "border-blue-400 dark:border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
    dotColor: "bg-blue-500",
  },
  // Speaker 5: Rose
  {
    primary: "#e11d48",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    bubbleBg: "bg-rose-50/40 dark:bg-rose-950/20",
    bubbleBorder: "border-rose-200 dark:border-rose-800/60",
    glowBorder: "border-rose-400 dark:border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    dotColor: "bg-rose-500",
  },
];

export function getSpeakerTheme(speakerId: number): SpeakerTheme {
  const safeId = Math.abs(speakerId) % SPEAKER_THEMES.length;
  return SPEAKER_THEMES[safeId];
}

export function formatTimestamp(seconds: number): string {
  if (seconds < 0 || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return `${mm}:${ss}`;
}

export function formatTimestampFull(seconds: number): string {
  if (seconds < 0 || isNaN(seconds)) return "00:00.0";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return `${mm}:${ss}.${tenths}`;
}

/**
 * Reduce a streaming meeting event into an updated list of TurnRecords.
 * Pure function: returns a new array and avoids mutating inputs.
 */
export function processMeetingEvent(
  turns: readonly TurnRecord[],
  event: StreamingMeetingEvent,
): TurnRecord[] {
  const result: TurnRecord[] = turns.map((t) => ({ ...t }));
  const resolvedName =
    event.identified_name ?? event.metadata?.identified_name ?? event.speaker_name;
  const isJustIdentified = Boolean(event.just_identified ?? event.metadata?.just_identified);
  const resolvedSimilarity = event.similarity ?? event.metadata?.similarity;

  if (event.event_type === "new_turn") {
    // Mark previous turns as inactive
    for (let i = 0; i < result.length; i++) {
      result[i].is_active = false;
      // If voiceprint just identified, retroactively update matching speaker turns
      if (isJustIdentified && result[i].speaker_id === event.speaker_id) {
        result[i].speaker_name = resolvedName;
        result[i].just_identified = true;
      }
    }

    const newTurn: TurnRecord = {
      turn_id: `turn_${result.length + 1}_${event.speaker_id}`,
      speaker_id: event.speaker_id,
      speaker_name: resolvedName,
      start_s: event.timestamp_s,
      end_s: event.timestamp_s,
      text: event.delta_text,
      has_overlap: event.is_overlap,
      overlap_speakers: [...(event.overlap_speakers || [])],
      is_active: true,
      just_identified: isJustIdentified,
      similarity: resolvedSimilarity,
    };
    result.push(newTurn);
    return result;
  }

  if (event.event_type === "delta") {
    if (result.length === 0) {
      // First delta without new_turn
      result.push({
        turn_id: `turn_1_${event.speaker_id}`,
        speaker_id: event.speaker_id,
        speaker_name: resolvedName,
        start_s: event.timestamp_s,
        end_s: event.timestamp_s,
        text: event.delta_text,
        has_overlap: event.is_overlap,
        overlap_speakers: [...(event.overlap_speakers || [])],
        is_active: true,
        just_identified: isJustIdentified,
        similarity: resolvedSimilarity,
      });
      return result;
    }

    const lastIdx = result.length - 1;
    const lastTurn = { ...result[lastIdx] };

    lastTurn.text += event.delta_text;
    lastTurn.end_s = Math.max(lastTurn.end_s, event.timestamp_s);

    if (event.is_overlap) {
      lastTurn.has_overlap = true;
      const merged = new Set([...lastTurn.overlap_speakers, ...(event.overlap_speakers || [])]);
      lastTurn.overlap_speakers = Array.from(merged);
    }

    if (isJustIdentified) {
      lastTurn.speaker_name = resolvedName;
      lastTurn.just_identified = true;
      lastTurn.similarity = resolvedSimilarity;

      // Retroactively update all earlier turns for this speaker
      for (let i = 0; i < lastIdx; i++) {
        if (result[i].speaker_id === event.speaker_id) {
          result[i].speaker_name = resolvedName;
          result[i].just_identified = true;
        }
      }
    }

    result[lastIdx] = lastTurn;
    return result;
  }

  if (event.event_type === "tail_flush") {
    if (result.length > 0) {
      const lastIdx = result.length - 1;
      result[lastIdx].text += event.delta_text;
      result[lastIdx].end_s = Math.max(result[lastIdx].end_s, event.timestamp_s);
      result[lastIdx].is_active = false;
    }
    return result;
  }

  return result;
}

/**
 * Calculate session metrics and telemetry summary from turns and processed events.
 */
export function calcSessionMetrics(
  turns: readonly TurnRecord[],
  eventsProcessed: readonly StreamingMeetingEvent[],
): MeetingSessionTelemetry {
  let totalChars = 0;
  let overlapCount = 0;
  let maxTimestamp = 0;
  const speakerStats: Record<number, SpeakerMetric> = {};

  for (const turn of turns) {
    totalChars += turn.text.length;
    if (turn.has_overlap) {
      overlapCount++;
    }
    maxTimestamp = Math.max(maxTimestamp, turn.end_s);

    if (!speakerStats[turn.speaker_id]) {
      speakerStats[turn.speaker_id] = { chars: 0, turns: 0, duration_s: 0 };
    }
    speakerStats[turn.speaker_id].chars += turn.text.length;
    speakerStats[turn.speaker_id].turns += 1;
    speakerStats[turn.speaker_id].duration_s += Math.max(0.5, turn.end_s - turn.start_s);
  }

  // Calculate average latency from events
  const latencies = eventsProcessed
    .map((e) => e.step_latency_ms)
    .filter((l) => typeof l === "number" && l > 0);
  const avgLatencyMs =
    latencies.length > 0
      ? Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 10) / 10
      : 1.6;

  // Real-Time Factor (RTF): compute ratio of processing to audio duration
  const totalAudioS = maxTimestamp > 0 ? maxTimestamp : 1;
  const estimatedProcS = (latencies.reduce((a, b) => a + b, 0) / 1000) || 0.05;
  const rtf = Math.round((estimatedProcS / totalAudioS) * 10000) / 10000;

  return {
    elapsed_s: Math.round(maxTimestamp * 10) / 10,
    totalChars,
    rtf: Math.max(0.005, Math.min(0.08, rtf)),
    avgLatencyMs,
    overlapCount,
    speakerStats,
  };
}

/**
 * Filter turns by speaker name, speaker ID, or 'all', along with keyword search query.
 */
export function filterTurnsBySpeaker(
  turns: readonly TurnRecord[],
  filterSpeaker: string | number | "all",
  searchQuery: string = "",
): TurnRecord[] {
  const q = searchQuery.trim().toLowerCase();
  return turns.filter((turn) => {
    if (filterSpeaker !== "all") {
      if (typeof filterSpeaker === "number") {
        if (turn.speaker_id !== filterSpeaker) return false;
      } else {
        const filterNorm = filterSpeaker.trim().toLowerCase();
        const nameNorm = turn.speaker_name.toLowerCase();
        if (!nameNorm.includes(filterNorm)) return false;
      }
    }
    if (q && !turn.text.toLowerCase().includes(q) && !turn.speaker_name.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

/**
 * Generate a deterministic snapshot state for the StageView fixtures.
 */
export function stageSnapshot(
  kind: PhaseId,
  state: string,
): {
  phase: PhaseId;
  turns: TurnRecord[];
  speakers: SpeakerProfile[];
  hasOverlapLocked: boolean;
  drawerOpen: boolean;
} {
  const baseSpeakers: SpeakerProfile[] = [
    {
      id: 0,
      name: "李四",
      title: "资深系统架构师",
      department: "基础算法组",
      avatar: "李",
      samplesCount: 4,
      totalDuration_s: 18.5,
      enrolledAt: "2026-09-24",
      isIdentified: true,
      colorKey: "teal",
      vectorDim: 192,
    },
    {
      id: 1,
      name: "张三",
      title: "AI 交互设计师",
      department: "体验设计组",
      avatar: "张",
      samplesCount: 3,
      totalDuration_s: 12.0,
      enrolledAt: "2026-09-25",
      isIdentified: true,
      colorKey: "emerald",
      vectorDim: 192,
    },
    {
      id: 2,
      name: "王五",
      title: "端智能工程师",
      department: "客户端技术组",
      avatar: "王",
      samplesCount: 5,
      totalDuration_s: 24.0,
      enrolledAt: "2026-09-22",
      isIdentified: true,
      colorKey: "amber",
      vectorDim: 192,
    },
    {
      id: 3,
      name: "赵六",
      title: "产品负责人",
      department: "智能协作业务部",
      avatar: "赵",
      samplesCount: 2,
      totalDuration_s: 9.5,
      enrolledAt: "2026-09-26",
      isIdentified: true,
      colorKey: "violet",
      vectorDim: 192,
    },
  ];

  const defaultTurns: TurnRecord[] = [
    {
      turn_id: "snap_1",
      speaker_id: 0,
      speaker_name: "李四 (Speaker 0)",
      start_s: 1.2,
      end_s: 6.8,
      text: "今天重点讨论会议客户端在多说话人场景下的打字机增量与抢话视觉交互。",
      has_overlap: false,
      overlap_speakers: [],
      is_active: false,
      just_identified: false,
    },
    {
      turn_id: "snap_2",
      speaker_id: 1,
      speaker_name: "张三",
      start_s: 7.2,
      end_s: 12.5,
      text: "我建议对话气泡给每位参会人分配专属色系，在名字刚刚声纹认出时触发轻微光晕平滑过渡。",
      has_overlap: state === "overlap",
      overlap_speakers: state === "overlap" ? [2] : [],
      is_active: false,
      just_identified: true,
      similarity: 0.84,
    },
    {
      turn_id: "snap_3",
      speaker_id: 2,
      speaker_name: "王五",
      start_s: 13.0,
      end_s: 18.2,
      text: "对，如果两人同时抢话开口，卡片边缘可以点亮呼吸胶囊，提示发生了重叠抢话。",
      has_overlap: state === "overlap",
      overlap_speakers: state === "overlap" ? [1] : [],
      is_active: true,
      just_identified: false,
    },
  ];

  return {
    phase: kind,
    turns: defaultTurns,
    speakers: baseSpeakers,
    hasOverlapLocked: state === "overlap",
    drawerOpen: state === "drawer",
  };
}
