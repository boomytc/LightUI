import type {
  MeetingMinutesData,
  SpeakerProfile,
  StreamingMeetingEvent,
} from "./types";

export type ScenarioId = "full" | "crosstalk" | "late_resolve";

export interface StreamScenario {
  id: ScenarioId;
  label: string;
  badge: string;
  description: string;
  events: StreamingMeetingEvent[];
}

export const INITIAL_SPEAKERS: SpeakerProfile[] = [
  {
    id: 0,
    name: "李四",
    title: "资深算法架构师",
    department: "基础语音算法组",
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
    title: "AI 体验设计师",
    department: "交互体验设计中心",
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
    department: "跨平台客户端组",
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
    title: "协同协作产品负责人",
    department: "智能办公产品线",
    avatar: "赵",
    samplesCount: 2,
    totalDuration_s: 9.5,
    enrolledAt: "2026-09-26",
    isIdentified: true,
    colorKey: "violet",
    vectorDim: 192,
  },
];

export const SIMULATED_EVENTS: StreamingMeetingEvent[] = [
  // Turn 1: Speaker 0 (李四)
  {
    event_type: "new_turn",
    timestamp_s: 1.2,
    speaker_id: 0,
    speaker_name: "李四 (Speaker 0)",
    delta_text: "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。",
    step_latency_ms: 1.6,
  },
  {
    event_type: "delta",
    timestamp_s: 3.5,
    speaker_id: 0,
    speaker_name: "李四 (Speaker 0)",
    delta_text: " 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。",
    step_latency_ms: 1.5,
  },
  {
    event_type: "delta",
    timestamp_s: 5.8,
    speaker_id: 0,
    speaker_name: "李四 (Speaker 0)",
    delta_text: " 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。",
    step_latency_ms: 1.4,
  },

  // Turn 2: Speaker 1 (Initial unknown Speaker 1 -> then late-identified as 张三!)
  {
    event_type: "new_turn",
    timestamp_s: 7.0,
    speaker_id: 1,
    speaker_name: "Speaker 1",
    delta_text: "从交互体验来看，",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，",
    step_latency_ms: 1.8,
  },
  {
    event_type: "delta",
    timestamp_s: 8.8,
    speaker_id: 1,
    speaker_name: "Speaker 1",
    delta_text: "以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。",
    step_latency_ms: 1.6,
  },
  {
    event_type: "delta",
    timestamp_s: 11.2,
    speaker_id: 1,
    speaker_name: "Speaker 1",
    delta_text: " 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。",
    step_latency_ms: 1.5,
    metadata: {
      just_identified: true,
      identified_name: "张三 (Speaker 1)",
      similarity: 0.865,
    },
  },

  // Turn 3: Speaker 2 (王五) with cross-talk overlap!
  {
    event_type: "new_turn",
    timestamp_s: 13.0,
    speaker_id: 2,
    speaker_name: "王五",
    delta_text: "对，尤其是在多人同时开口或者激烈抢话的场景下，",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，",
    step_latency_ms: 1.7,
  },
  {
    event_type: "delta",
    timestamp_s: 14.8,
    speaker_id: 2,
    speaker_name: "王五",
    delta_text: "不能把两个人的文字简单硬拼成一串。",
    is_overlap: true,
    overlap_speakers: [0],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。",
    step_latency_ms: 2.1,
  },
  {
    event_type: "delta",
    timestamp_s: 16.5,
    speaker_id: 2,
    speaker_name: "王五",
    delta_text: "必须在气泡边缘亮起呼吸警示并标上重叠胶囊。",
    is_overlap: true,
    overlap_speakers: [0],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。必须在气泡边缘亮起呼吸警示并标上重叠胶囊。",
    step_latency_ms: 1.9,
  },

  // Turn 4: Speaker 0 (李四) overlap response
  {
    event_type: "new_turn",
    timestamp_s: 17.2,
    speaker_id: 0,
    speaker_name: "李四 (Speaker 0)",
    delta_text: "没错！底层输出的重叠时序帧正好对应这个视觉状态。",
    is_overlap: true,
    overlap_speakers: [2],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。必须在气泡边缘亮起呼吸警示并标上重叠胶囊。没错！底层输出的重叠时序帧正好对应这个视觉状态。",
    step_latency_ms: 1.6,
  },
  {
    event_type: "delta",
    timestamp_s: 19.5,
    speaker_id: 0,
    speaker_name: "李四 (Speaker 0)",
    delta_text: " 这样读者既能知道当时有人打断，又不会丢失各自连贯的语流表达。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。必须在气泡边缘亮起呼吸警示并标上重叠胶囊。没错！底层输出的重叠时序帧正好对应这个视觉状态。 这样读者既能知道当时有人打断，又不会丢失各自连贯的语流表达。",
    step_latency_ms: 1.5,
  },

  // Turn 5: Speaker 3 (赵六) summary conclusion
  {
    event_type: "new_turn",
    timestamp_s: 21.0,
    speaker_id: 3,
    speaker_name: "赵六",
    delta_text: "很好。会前声纹抽屉建档、会中双流打字机跟随、会后双栏分屏看板，",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。必须在气泡边缘亮起呼吸警示并标上重叠胶囊。没错！底层输出的重叠时序帧正好对应这个视觉状态。 这样读者既能知道当时有人打断，又不会丢失各自连贯的语流表达。很好。会前声纹抽屉建档、会中双流打字机跟随、会后双栏分屏看板，",
    step_latency_ms: 1.6,
  },
  {
    event_type: "delta",
    timestamp_s: 23.5,
    speaker_id: 3,
    speaker_name: "赵六",
    delta_text: "这个三阶段生命周期非常清晰，一键结束会议即可交付高质量纪要。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。必须在气泡边缘亮起呼吸警示并标上重叠胶囊。没错！底层输出的重叠时序帧正好对应这个视觉状态。 这样读者既能知道当时有人打断，又不会丢失各自连贯的语流表达。很好。会前声纹抽屉建档、会中双流打字机跟随、会后双栏分屏看板，这个三阶段生命周期非常清晰，一键结束会议即可交付高质量纪要。",
    step_latency_ms: 1.4,
  },
  {
    event_type: "tail_flush",
    timestamp_s: 24.2,
    speaker_id: 3,
    speaker_name: "赵六",
    delta_text: "我们就按这个方案立即推进交互落地！",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text:
      "大家早上好，今天我们重点讨论智能会议系统的客户端 UI 与双流时空绑定打磨。 后端引擎现在把单步增量延迟稳定在 1.6ms，显存常驻也收敛到了 3.1GB。 前端不论接入何种流式通信管道，只要消费 StreamingMeetingEvent 即可。从交互体验来看，以前最让人头疼的是‘先出字后认人’导致的频繁整段闪烁。 现在有了后验认人，当累积了 2 秒声纹后，界面平滑过渡即可。对，尤其是在多人同时开口或者激烈抢话的场景下，不能把两个人的文字简单硬拼成一串。必须在气泡边缘亮起呼吸警示并标上重叠胶囊。没错！底层输出的重叠时序帧正好对应这个视觉状态。 这样读者既能知道当时有人打断，又不会丢失各自连贯的语流表达。很好。会前声纹抽屉建档、会中双流打字机跟随、会后双栏分屏看板，这个三阶段生命周期非常清晰，一键结束会议即可交付高质量纪要。我们就按这个方案立即推进交互落地！",
    step_latency_ms: 1.2,
    is_final: true,
  },
];

export const CROSSTALK_EVENTS: StreamingMeetingEvent[] = [
  {
    event_type: "new_turn",
    timestamp_s: 1.0,
    speaker_id: 0,
    speaker_name: "李四",
    delta_text: "关于这个交互方案，我认为首屏必须保持单流打字。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "关于这个交互方案，我认为首屏必须保持单流打字。",
    step_latency_ms: 1.5,
  },
  {
    event_type: "new_turn",
    timestamp_s: 2.2,
    speaker_id: 2,
    speaker_name: "王五",
    delta_text: "但是单流无法表达抢话！",
    is_overlap: true,
    overlap_speakers: [0],
    cumulative_text: "但是单流无法表达抢话！",
    step_latency_ms: 2.0,
  },
  {
    event_type: "delta",
    timestamp_s: 3.4,
    speaker_id: 0,
    speaker_name: "李四",
    delta_text: " （李四补充：可以做行内胶囊标记）",
    is_overlap: true,
    overlap_speakers: [2],
    cumulative_text: "关于这个交互方案，我认为首屏必须保持单流打字。 （李四补充：可以做行内胶囊标记）",
    step_latency_ms: 1.8,
  },
  {
    event_type: "delta",
    timestamp_s: 4.8,
    speaker_id: 2,
    speaker_name: "王五",
    delta_text: "对，行内呼吸警示不仅保留了各自语境，读者一目了然！",
    is_overlap: true,
    overlap_speakers: [0],
    cumulative_text: "但是单流无法表达抢话！对，行内呼吸警示不仅保留了各自语境，读者一目了然！",
    step_latency_ms: 1.6,
  },
  {
    event_type: "tail_flush",
    timestamp_s: 6.0,
    speaker_id: 2,
    speaker_name: "王五",
    delta_text: "这个交互表现非常连贯。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "但是单流无法表达抢话！对，行内呼吸警示不仅保留了各自语境，读者一目了然！这个交互表现非常连贯。",
    step_latency_ms: 1.2,
    is_final: true,
  },
];

export const LATE_RESOLVE_EVENTS: StreamingMeetingEvent[] = [
  {
    event_type: "new_turn",
    timestamp_s: 0.8,
    speaker_id: 1,
    speaker_name: "Speaker 1",
    delta_text: "你好，我现在开始发言，此时系统正在做增量分块。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "你好，我现在开始发言，此时系统正在做增量分块。",
    step_latency_ms: 1.6,
  },
  {
    event_type: "delta",
    timestamp_s: 2.1,
    speaker_id: 1,
    speaker_name: "Speaker 1",
    delta_text: " 请注意看顶部的说话人标签，目前仍然是匿名占位符。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "你好，我现在开始发言，此时系统正在做增量分块。 请注意看顶部的说话人标签，目前仍然是匿名占位符。",
    step_latency_ms: 1.7,
  },
  {
    event_type: "delta",
    timestamp_s: 3.5,
    speaker_id: 1,
    speaker_name: "Speaker 1",
    delta_text: " 声纹特征提取完毕，余弦相似度 0.89 触发更名。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "你好，我现在开始发言，此时系统正在做增量分块。 请注意看顶部的说话人标签，目前仍然是匿名占位符。 声纹特征提取完毕，余弦相似度 0.89 触发更名。",
    step_latency_ms: 1.5,
    just_identified: true,
    similarity: 0.892,
    identified_name: "张三 (Speaker 1)",
    metadata: {
      just_identified: true,
      similarity: 0.892,
      identified_name: "张三 (Speaker 1)",
    },
  },
  {
    event_type: "tail_flush",
    timestamp_s: 4.8,
    speaker_id: 1,
    speaker_name: "张三",
    delta_text: " 整个过程气泡无需整体重绘，光标自然前推。",
    is_overlap: false,
    overlap_speakers: [],
    cumulative_text: "你好，我现在开始发言，此时系统正在做增量分块。 请注意看顶部的说话人标签，目前仍然是匿名占位符。 声纹特征提取完毕，余弦相似度 0.89 触发更名。 整个过程气泡无需整体重绘，光标自然前推。",
    step_latency_ms: 1.3,
    is_final: true,
  },
];

export const STREAM_SCENARIOS: StreamScenario[] = [
  {
    id: "full",
    label: "全流程标准研讨",
    badge: "全景",
    description: "涵盖声纹建档、多说话人轮转、声纹迟到更名以及抢话冲突全景演示",
    events: SIMULATED_EVENTS,
  },
  {
    id: "crosstalk",
    label: "密集抢话碰撞焦点",
    badge: "重叠冲突",
    description: "聚焦模拟多人同时开口时的行内微光呼吸提示与重叠碰撞徽标吸附",
    events: CROSSTALK_EVENTS,
  },
  {
    id: "late_resolve",
    label: "声纹后验平滑更名",
    badge: "无感过渡",
    description: "聚焦先出字（Speaker 0 占位）、后认人（累积声学采样后无感平滑切换真实姓名）",
    events: LATE_RESOLVE_EVENTS,
  },
];

export const FINAL_MINUTES: MeetingMinutesData = {
  title: "智能会议系统多说话人时空流与纪要工作台评审会",
  date: "2026-09-26",
  durationStr: "24 秒 (演示快照)",
  attendees: ["李四", "张三", "王五", "赵六"],
  executiveSummary:
    "本次技术评审会论证并通过了智能会议客户端的三阶段架构设计方案。确认了基于 StreamingMeetingEvent 的单向事件流协议，实现了增量打字机平滑跟随、声纹后验认人无感渐变、重叠抢话呼吸徽标碰撞警示，以及会后双栏分屏纪要工作台的无缝跃迁。",
  topics: [
    {
      title: "一、后端引擎与事件流规范",
      speakers: ["李四"],
      summary: "后端引擎单步延迟保持在 1.6ms，显存占用收敛至 3.1GB，标准化事件流零适配成本支持前端消费。",
      keyPoints: [
        "多说话人流式分块推理保证了声学时序追踪。",
        "StreamingMeetingEvent 事件体包含增量文本、说话人 ID/姓名、重叠标志及声纹后验认人元数据。",
        "端到端 RTF 稳定在 0.05 以下，杜绝音频积压与客户端掉帧。",
      ],
    },
    {
      title: "二、流式交互与抢话碰撞呈现",
      speakers: ["张三", "王五", "李四"],
      summary: "重点解决先出字后认人的视觉跳动问题，以及多说话人重叠抢话时的语流拆分与警示机制。",
      keyPoints: [
        "声纹后验认人（just_identified: true）触发专属光晕波纹，平滑重命名，避免 DOM 强制重挂。",
        "检测到 cross-talk 重叠语音时，气泡边缘点亮呼吸红/琥珀光晕，并标注 ⚡重叠 小胶囊。",
        "各说话人分配专属色彩系统（青/绿/黄/紫），大幅提升快速浏览辨识度。",
      ],
    },
    {
      title: "三、会后交付与纪要分屏看板",
      speakers: ["赵六"],
      summary: "确立‘会前声纹抽屉建档、会中双流打字机、会后双栏分屏’三阶段全景交互生命周期。",
      keyPoints: [
        "左栏时间轴流水支持物理起止时间戳定位、参会人快捷过滤及关键字搜索。",
        "右栏提供结构化正式 Markdown 纪要与交互式 Action Items 待办项勾选。",
        "支持一键复制 Markdown 源码与导出 HTML/PDF，完成从实时速记到正式纪要的闭环交付。",
      ],
    },
  ],
  decisions: [
    "全面采纳三阶段（Prep/Live/Summary）生命周期作为智能会议客户端的标准交互范式。",
    "流式转写气泡严格遵循增量追加机制，严禁每次收到分块都全量重渲染 DOM。",
    "重叠抢话采用行内气泡微光呼吸提示，杜绝使用打断式弹窗通知用户。",
  ],
  actionItems: [
    {
      id: "act_1",
      task: "在会议客户端落地声纹抽屉组件与 3 秒极简录音交互",
      assignee: "张三",
      assigneeAvatar: "张",
      deadline: "2026-09-28",
      completed: true,
    },
    {
      id: "act_2",
      task: "根据 StreamingMeetingEvent 完成流式事件消费管道集成",
      assignee: "王五",
      assigneeAvatar: "王",
      deadline: "2026-09-29",
      completed: false,
    },
    {
      id: "act_3",
      task: "打磨高保真 Markdown 纪要渲染与 Action Items 富文本编辑导出",
      assignee: "李四",
      assigneeAvatar: "李",
      deadline: "2026-09-30",
      completed: false,
    },
  ],
  rawMarkdown: `# 智能会议系统多说话人时空流与纪要工作台评审会

- **会议日期**：2026-09-26
- **会议时长**：24 秒 (演示快照)
- **参会人员**：李四、张三、王五、赵六

---

## 一、 会议核心摘要
本次技术评审会论证并通过了智能会议客户端的三阶段架构设计方案。确认了基于 StreamingMeetingEvent 的单向事件流协议，实现了增量打字机平滑跟随、声纹后验认人无感渐变、重叠抢话呼吸徽标碰撞警示，以及会后双栏分屏纪要工作台的无缝跃迁。

---

## 二、 关键议题讨论

### 1. 后端引擎与事件流规范
- 多说话人流式分块推理保证了声学时序追踪。
- StreamingMeetingEvent 事件体包含增量文本、说话人 ID/姓名、重叠标志及声纹后验认人元数据。
- 单步增量延迟稳定在 1.6ms，显存占用收敛至 3.1GB，端到端 RTF 稳定在 0.05 以下。

### 2. 流式交互与抢话碰撞呈现
- 解决“先出字后认人”问题：声纹后验认人（just_identified: true）触发专属光晕波纹，平滑重命名，避免 DOM 强制重挂。
- 多人重叠抢话（Cross-talk）：气泡边缘点亮呼吸红/琥珀光晕，并标注 ⚡重叠 胶囊。
- 各说话人分配专属色彩系统（青/绿/黄/紫），大幅提升快速浏览辨识度。

### 3. 会后交付与纪要分屏看板
- 会前声纹抽屉建档、会中双流打字机跟随、会后双栏分屏看板，三阶段全景交互闭环。
- 左栏时间轴流水支持物理起止时间戳定位、参会人快捷过滤及关键字搜索。
- 右栏提供结构化正式 Markdown 纪要与交互式 Action Items 待办项勾选。

---

## 三、 核心决议
1. 全面采纳三阶段（Prep/Live/Summary）生命周期作为智能会议客户端的标准交互范式。
2. 流式转写气泡严格遵循增量追加机制，严禁每次收到分块都全量重渲染 DOM。
3. 重叠抢话采用行内气泡微光呼吸提示，杜绝使用打断式弹窗通知用户。

---

## 四、 待办事项 (Action Items)
- [x] 在会议客户端落地声纹抽屉组件与 3 秒极简录音交互 (@张三 - 2026-09-28)
- [ ] 根据 StreamingMeetingEvent 完成流式事件消费管道集成 (@王五 - 2026-09-29)
- [ ] 打磨高保真 Markdown 纪要渲染与 Action Items 富文本编辑导出 (@李四 - 2026-09-30)
`,
};
