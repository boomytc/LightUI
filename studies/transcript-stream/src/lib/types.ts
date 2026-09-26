export type PhaseId = "prep" | "live" | "summary";

export interface StreamingMeetingEvent {
  event_type: "new_turn" | "delta" | "tail_flush" | "status";
  timestamp_s: number;
  speaker_id: number;
  speaker_name: string;
  delta_text: string;
  is_overlap: boolean;
  overlap_speakers: number[];
  cumulative_text: string;
  is_final?: boolean;
  step_latency_ms: number;
  just_identified?: boolean;
  similarity?: number;
  identified_name?: string;
  metadata?: {
    just_identified?: boolean;
    identified_name?: string;
    similarity?: number;
    [key: string]: unknown;
  };
}

export interface TurnRecord {
  turn_id: string;
  speaker_id: number;
  speaker_name: string;
  start_s: number;
  end_s: number;
  text: string;
  has_overlap: boolean;
  overlap_speakers: number[];
  is_active: boolean;
  just_identified?: boolean;
  similarity?: number;
}

export interface SpeakerProfile {
  id: number;
  name: string;
  title: string;
  department: string;
  avatar: string;
  samplesCount: number;
  totalDuration_s: number;
  enrolledAt: string;
  isIdentified: boolean;
  colorKey: "teal" | "emerald" | "amber" | "violet" | "blue" | "rose";
  vectorDim?: number;
}

export interface SpeakerMetric {
  chars: number;
  turns: number;
  duration_s: number;
}

export interface MeetingSessionTelemetry {
  elapsed_s: number;
  totalChars: number;
  rtf: number;
  avgLatencyMs: number;
  overlapCount: number;
  speakerStats: Record<number, SpeakerMetric>;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  assigneeAvatar: string;
  deadline: string;
  completed: boolean;
}

export interface TopicItem {
  title: string;
  speakers: string[];
  summary: string;
  keyPoints: string[];
}

export interface MeetingMinutesData {
  title: string;
  date: string;
  durationStr: string;
  attendees: string[];
  executiveSummary: string;
  topics: TopicItem[];
  decisions: string[];
  actionItems: ActionItem[];
  rawMarkdown: string;
}
