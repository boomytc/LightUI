import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  calcSessionMetrics,
  filterTurnsBySpeaker,
  formatTimestamp,
  formatTimestampFull,
  getSpeakerTheme,
  isKindId,
  processMeetingEvent,
  stageSnapshot,
} from "./machines";
import type { StreamingMeetingEvent, TurnRecord } from "./types";
import {
  CROSSTALK_EVENTS,
  LATE_RESOLVE_EVENTS,
  STREAM_SCENARIOS,
} from "./mock-data";

describe("KIND_IDS & isKindId", () => {
  it("contains the three phases: live, prep, summary", () => {
    assert.deepEqual(KIND_IDS, ["live", "prep", "summary"]);
    assert.equal(isKindId("live"), true);
    assert.equal(isKindId("prep"), true);
    assert.equal(isKindId("summary"), true);
    assert.equal(isKindId("chat"), false);
    assert.equal(isKindId("unknown"), false);
  });
});

describe("getSpeakerTheme", () => {
  it("returns distinct theme properties for each speaker", () => {
    const t0 = getSpeakerTheme(0);
    const t1 = getSpeakerTheme(1);
    const t2 = getSpeakerTheme(2);

    assert.ok(t0.primary.length > 0);
    assert.notEqual(t0.primary, t1.primary);
    assert.notEqual(t1.primary, t2.primary);
    assert.ok(t0.dotColor.includes("teal"));
    assert.ok(t1.dotColor.includes("emerald"));
  });

  it("safely wraps speaker index without out-of-bounds errors", () => {
    const tLarge = getSpeakerTheme(10);
    assert.ok(tLarge.primary.length > 0);
    const tNegative = getSpeakerTheme(-3);
    assert.ok(tNegative.primary.length > 0);
  });
});

describe("formatTimestamp", () => {
  it("formats seconds into mm:ss string", () => {
    assert.equal(formatTimestamp(0), "00:00");
    assert.equal(formatTimestamp(5), "00:05");
    assert.equal(formatTimestamp(65), "01:05");
    assert.equal(formatTimestamp(125.8), "02:05");
  });

  it("handles negative or invalid seconds safely", () => {
    assert.equal(formatTimestamp(-1), "00:00");
    assert.equal(formatTimestamp(NaN), "00:00");
  });

  it("formatTimestampFull includes tenths of a second", () => {
    assert.equal(formatTimestampFull(14.5), "00:14.5");
    assert.equal(formatTimestampFull(60.2), "01:00.2");
  });
});

describe("processMeetingEvent", () => {
  it("creates a new turn on event_type: new_turn", () => {
    const turns: TurnRecord[] = [];
    const event: StreamingMeetingEvent = {
      event_type: "new_turn",
      timestamp_s: 2.5,
      speaker_id: 0,
      speaker_name: "Speaker 0",
      delta_text: "大家好",
      is_overlap: false,
      overlap_speakers: [],
      cumulative_text: "大家好",
      step_latency_ms: 1.5,
    };

    const next = processMeetingEvent(turns, event);
    assert.equal(next.length, 1);
    assert.equal(next[0].speaker_id, 0);
    assert.equal(next[0].text, "大家好");
    assert.equal(next[0].is_active, true);
    assert.equal(next[0].start_s, 2.5);
  });

  it("appends delta text to the active turn", () => {
    const initialTurn: TurnRecord = {
      turn_id: "turn_1_0",
      speaker_id: 0,
      speaker_name: "Speaker 0",
      start_s: 2.5,
      end_s: 2.5,
      text: "大家好",
      has_overlap: false,
      overlap_speakers: [],
      is_active: true,
    };

    const deltaEvent: StreamingMeetingEvent = {
      event_type: "delta",
      timestamp_s: 3.2,
      speaker_id: 0,
      speaker_name: "Speaker 0",
      delta_text: "，今天开始开会。",
      is_overlap: false,
      overlap_speakers: [],
      cumulative_text: "大家好，今天开始开会。",
      step_latency_ms: 1.6,
    };

    const next = processMeetingEvent([initialTurn], deltaEvent);
    assert.equal(next.length, 1);
    assert.equal(next[0].text, "大家好，今天开始开会。");
    assert.equal(next[0].end_s, 3.2);
  });

  it("handles overlap collision in delta event", () => {
    const initialTurn: TurnRecord = {
      turn_id: "turn_1_0",
      speaker_id: 0,
      speaker_name: "Speaker 0",
      start_s: 2.5,
      end_s: 3.0,
      text: "我有异议",
      has_overlap: false,
      overlap_speakers: [],
      is_active: true,
    };

    const overlapDelta: StreamingMeetingEvent = {
      event_type: "delta",
      timestamp_s: 3.5,
      speaker_id: 0,
      speaker_name: "Speaker 0",
      delta_text: "请稍等",
      is_overlap: true,
      overlap_speakers: [1],
      cumulative_text: "我有异议请稍等",
      step_latency_ms: 1.8,
    };

    const next = processMeetingEvent([initialTurn], overlapDelta);
    assert.equal(next[0].has_overlap, true);
    assert.deepEqual(next[0].overlap_speakers, [1]);
  });

  it("retroactively updates speaker name when just_identified is true", () => {
    const turn1: TurnRecord = {
      turn_id: "turn_1_0",
      speaker_id: 0,
      speaker_name: "Speaker 0",
      start_s: 1.0,
      end_s: 3.0,
      text: "第一句话",
      has_overlap: false,
      overlap_speakers: [],
      is_active: false,
    };
    const turn2: TurnRecord = {
      turn_id: "turn_2_0",
      speaker_id: 0,
      speaker_name: "Speaker 0",
      start_s: 3.2,
      end_s: 4.0,
      text: "第二句话",
      has_overlap: false,
      overlap_speakers: [],
      is_active: true,
    };

    const identifyDelta: StreamingMeetingEvent = {
      event_type: "delta",
      timestamp_s: 4.5,
      speaker_id: 0,
      speaker_name: "Speaker 0",
      delta_text: "声纹匹配完成",
      is_overlap: false,
      overlap_speakers: [],
      cumulative_text: "第一句话第二句话声纹匹配完成",
      step_latency_ms: 1.4,
      metadata: {
        just_identified: true,
        identified_name: "李四 (Speaker 0)",
        similarity: 0.85,
      },
    };

    const next = processMeetingEvent([turn1, turn2], identifyDelta);
    assert.equal(next[0].speaker_name, "李四 (Speaker 0)");
    assert.equal(next[1].speaker_name, "李四 (Speaker 0)");
    assert.equal(next[1].just_identified, true);
    assert.equal(next[1].similarity, 0.85);
  });

  it("supports top-level just_identified and similarity fields per StreamingMeetingEvent specification", () => {
    const turn1: TurnRecord = {
      turn_id: "turn_1_0",
      speaker_id: 0,
      speaker_name: "Speaker 0",
      start_s: 1.0,
      end_s: 3.0,
      text: "首句发言",
      has_overlap: false,
      overlap_speakers: [],
      is_active: true,
    };

    const topLevelEvent: StreamingMeetingEvent = {
      event_type: "delta",
      timestamp_s: 3.5,
      speaker_id: 0,
      speaker_name: "Speaker 0",
      delta_text: "认人成功",
      is_overlap: false,
      overlap_speakers: [],
      cumulative_text: "首句发言认人成功",
      step_latency_ms: 1.5,
      just_identified: true,
      similarity: 0.82,
      identified_name: "李四 (Speaker 0)",
    };

    const next = processMeetingEvent([turn1], topLevelEvent);
    assert.equal(next[0].speaker_name, "李四 (Speaker 0)");
    assert.equal(next[0].just_identified, true);
    assert.equal(next[0].similarity, 0.82);
  });

  it("handles tail_flush to finish active turn", () => {
    const turn: TurnRecord = {
      turn_id: "turn_1_0",
      speaker_id: 0,
      speaker_name: "李四",
      start_s: 1.0,
      end_s: 4.0,
      text: "会议结束",
      has_overlap: false,
      overlap_speakers: [],
      is_active: true,
    };

    const flushEvent: StreamingMeetingEvent = {
      event_type: "tail_flush",
      timestamp_s: 4.2,
      speaker_id: 0,
      speaker_name: "李四",
      delta_text: "。",
      is_overlap: false,
      overlap_speakers: [],
      cumulative_text: "会议结束。",
      step_latency_ms: 1.2,
    };

    const next = processMeetingEvent([turn], flushEvent);
    assert.equal(next[0].text, "会议结束。");
    assert.equal(next[0].is_active, false);
  });
});

describe("calcSessionMetrics", () => {
  it("summarizes character counts, turns, overlaps, and latency", () => {
    const turns: TurnRecord[] = [
      {
        turn_id: "t1",
        speaker_id: 0,
        speaker_name: "李四",
        start_s: 0.0,
        end_s: 5.0,
        text: "第一段话",
        has_overlap: false,
        overlap_speakers: [],
        is_active: false,
      },
      {
        turn_id: "t2",
        speaker_id: 1,
        speaker_name: "张三",
        start_s: 5.5,
        end_s: 10.0,
        text: "第二段抢话",
        has_overlap: true,
        overlap_speakers: [0],
        is_active: false,
      },
    ];

    const events: StreamingMeetingEvent[] = [
      {
        event_type: "new_turn",
        timestamp_s: 0.0,
        speaker_id: 0,
        speaker_name: "李四",
        delta_text: "第一段话",
        is_overlap: false,
        overlap_speakers: [],
        cumulative_text: "第一段话",
        step_latency_ms: 1.5,
      },
      {
        event_type: "delta",
        timestamp_s: 5.5,
        speaker_id: 1,
        speaker_name: "张三",
        delta_text: "第二段抢话",
        is_overlap: true,
        overlap_speakers: [0],
        cumulative_text: "第一段话第二段抢话",
        step_latency_ms: 2.5,
      },
    ];

    const telemetry = calcSessionMetrics(turns, events);
    assert.equal(telemetry.totalChars, 9);
    assert.equal(telemetry.overlapCount, 1);
    assert.equal(telemetry.elapsed_s, 10.0);
    assert.equal(telemetry.avgLatencyMs, 2.0);
    assert.equal(telemetry.speakerStats[0].chars, 4);
    assert.equal(telemetry.speakerStats[1].chars, 5);
  });
});

describe("filterTurnsBySpeaker", () => {
  const sampleTurns: TurnRecord[] = [
    {
      turn_id: "1",
      speaker_id: 0,
      speaker_name: "李四",
      start_s: 0,
      end_s: 2,
      text: "架构设计",
      has_overlap: false,
      overlap_speakers: [],
      is_active: false,
    },
    {
      turn_id: "2",
      speaker_id: 1,
      speaker_name: "张三",
      start_s: 3,
      end_s: 5,
      text: "交互规范",
      has_overlap: false,
      overlap_speakers: [],
      is_active: false,
    },
  ];

  it("filters by speaker id", () => {
    const filtered0 = filterTurnsBySpeaker(sampleTurns, 0);
    assert.equal(filtered0.length, 1);
    assert.equal(filtered0[0].speaker_id, 0);

    const filtered1 = filterTurnsBySpeaker(sampleTurns, 1);
    assert.equal(filtered1.length, 1);
    assert.equal(filtered1[0].speaker_id, 1);
  });

  it("returns all turns when filter is 'all'", () => {
    const all = filterTurnsBySpeaker(sampleTurns, "all");
    assert.equal(all.length, 2);
  });

  it("filters by text query", () => {
    const matched = filterTurnsBySpeaker(sampleTurns, "all", "规范");
    assert.equal(matched.length, 1);
    assert.equal(matched[0].speaker_name, "张三");
  });

  it("filters by speaker name string directly as required by minutes board", () => {
    const matchedZhang = filterTurnsBySpeaker(sampleTurns, "张三");
    assert.equal(matchedZhang.length, 1);
    assert.equal(matchedZhang[0].speaker_name, "张三");

    const matchedLi = filterTurnsBySpeaker(sampleTurns, "李四");
    assert.equal(matchedLi.length, 1);
    assert.equal(matchedLi[0].speaker_name, "李四");
  });
});

describe("stageSnapshot", () => {
  it("provides deterministic data for stage fixtures", () => {
    const liveSnap = stageSnapshot("live", "default");
    assert.equal(liveSnap.phase, "live");
    assert.equal(liveSnap.turns.length, 3);
    assert.equal(liveSnap.speakers.length, 4);
    assert.equal(liveSnap.hasOverlapLocked, false);

    const overlapSnap = stageSnapshot("live", "overlap");
    assert.equal(overlapSnap.hasOverlapLocked, true);
    assert.equal(overlapSnap.turns[1].has_overlap, true);

    const drawerSnap = stageSnapshot("prep", "drawer");
    assert.equal(drawerSnap.drawerOpen, true);
  });
});

describe("STREAM_SCENARIOS event reduction", () => {
  it("defines the 3 core interactive scenario suites", () => {
    assert.equal(STREAM_SCENARIOS.length, 3);
    const ids = STREAM_SCENARIOS.map((s) => s.id);
    assert.deepEqual(ids, ["full", "crosstalk", "late_resolve"]);
  });

  it("reduces CROSSTALK_EVENTS preserving cross-talk overlap metadata", () => {
    const reducedTurns = CROSSTALK_EVENTS.reduce(processMeetingEvent, [] as TurnRecord[]);
    assert.equal(reducedTurns.length, 2);
    // Speaker 0 (李四)
    assert.equal(reducedTurns[0].speaker_id, 0);
    assert.equal(reducedTurns[0].has_overlap, true);
    assert.deepEqual(reducedTurns[0].overlap_speakers, [2]);
    assert.ok(reducedTurns[0].text.includes("关于这个交互方案"));
    assert.ok(reducedTurns[0].text.includes("李四补充：可以做行内胶囊标记"));

    // Speaker 2 (王五)
    assert.equal(reducedTurns[1].speaker_id, 2);
    assert.equal(reducedTurns[1].has_overlap, true);
    assert.ok(reducedTurns[1].text.includes("但是单流无法表达抢话！"));
    assert.equal(reducedTurns[1].is_active, false); // ended by tail_flush
  });

  it("reduces LATE_RESOLVE_EVENTS retroactively renaming speaker from placeholder", () => {
    const reducedTurns = LATE_RESOLVE_EVENTS.reduce(processMeetingEvent, [] as TurnRecord[]);
    assert.equal(reducedTurns.length, 1);
    const turn = reducedTurns[0];
    assert.equal(turn.speaker_id, 1);
    // Verified that name transitioned to identified name
    assert.equal(turn.speaker_name, "张三 (Speaker 1)");
    assert.equal(turn.just_identified, true);
    assert.ok(turn.similarity !== undefined && turn.similarity > 0.85);
    assert.ok(turn.text.includes("你好，我现在开始发言"));
    assert.ok(turn.text.includes("余弦相似度 0.89 触发更名"));
    assert.ok(turn.text.includes("整个过程气泡无需整体重绘"));
    assert.equal(turn.is_active, false); // tail_flush completed turn
  });
});
