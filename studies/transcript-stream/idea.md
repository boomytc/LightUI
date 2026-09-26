# 转录流：实时多说话人流式语音转写与纪要交互规范

实时智能会议与速记系统的前端体验，远比普通单向大语言模型打字聊天复杂。
在真实物理会议中，多位参会者会频繁交替发言、激烈抢话重叠（Cross-talk / Overlap）；而底层语音识别（ASR）与声纹识别（VPR）由于计算窗口不对齐，天然存在“先增量出字、后延迟认人”的时空异步性。

本研究提炼了实时语音交互的**完整三阶段生命周期（Pre-meeting Roster → Live Dual-stream Stage → Post-meeting Minutes Workbench）**与**时空流式事件驱动架构**。

---

## 1. 缺失时用户会遭遇什么破坏？

1. **增量跳动与视觉撕裂（Full Redraw Jitter）**：
   朴素前端在收到每个 ASR 分块增量时，直接以整段文本重新赋值给 DOM，导致光标抖动、滚动条疯狂闪烁、文字选择失效。
2. **声纹认人迟到的身份撕裂（Late-bound Speaker Split）**：
   语音识别分块仅需 ~300ms 即可产出首字，但高精度声纹识别（如 192 维向量提取与余弦匹配）通常需要累积 1.5s~3s 的有效纯净语音。
   若前端没有后验重解析机制，要么前几秒被写死为“未知说话人/Speaker 0”不可回溯更正；要么强行重绘历史会话引发剧烈跳帧。
3. **多人重叠抢话（Cross-talk）丢失语境**：
   多人同时发言时，单流文本往往把两人字词无序穿插拼接，读者根本分不清哪句话是谁在何时插嘴打断，丢失了会议争论的真实情绪与逻辑。
4. **会中实时态与会后交付态割裂**：
   会议进行中，用户需要低延迟打字机跟随、麦克风声学波形、实时 RTF 与吞吐遥测；而会议结束后，用户需要时间轴人名过滤、按议题归纳、关键决议与可交互的待办（Action Items）卡片。二者若杂糅会导致认知过载。

---

## 2. 核心状态机与几何时序规范

### (1) 流式事件驱动契约 (Streaming Meeting Event Protocol)
前端建立统一的单向事件流消费模型，驱动轻量不可变状态推进：
```ts
interface StreamingMeetingEvent {
  event_type: "new_turn" | "delta" | "tail_flush" | "status";
  timestamp_s: float;
  speaker_id: number;
  speaker_name: string;        // 初始为 "Speaker 0" 或临时占位
  delta_text: string;          // 本次增量文本
  is_overlap: boolean;         // 抢话重叠指示
  overlap_speakers: number[];  // 参与重叠的其他说话人
  cumulative_text: string;     // 累积全量文本
  step_latency_ms: number;     // 单步处理延迟（如 1.6ms）
  just_identified?: boolean;   // 根字段支持（直出模式）
  similarity?: number;         // 声纹余弦相似度（如 0.82）
  identified_name?: string;    // 绑定的参会人真实姓名
  metadata?: {
    just_identified?: boolean; // 嵌套字段兼容（服务端原生序列化结构）
    identified_name?: string;
    similarity?: number;
  };
}
```

### (2) 状态机三阶段生命周期 (Three-Phase Lifecycle)
- **阶段 1：会前声纹抽屉 (Voiceprint Drawer - `prep`)**
  - 管理已录入的参会人底库：姓名、部门、已注册样本数、总时长与 192 维特征摘要；
  - 极简录入流：提供 3 秒麦克风录入倒计时与拖拽微信语音音频文件解析，录入后自动计算余弦阈值并更新参会人卡片。
- **阶段 2：会中实时双流主舞台 (Live Stage - `live`)**
  - **动态话轮绑定 (Turn Binding)**：
    遇到 `new_turn` 时在视图流创建新话轮气泡，为其分配说话人专属色相（Teal、Emerald、Amber、Violet）；
  - **增量平滑打字机 (Smooth Typewriter)**：
    遇到 `delta` 时就地追加文本，保持打字机呼吸游标，配合自适应吸底滚动；
  - **后验声纹认人无感渐变 (Late-bound Resolve Glow)**：
    当事件携带 `just_identified: true` 时，该说话人的旧气泡头标识通过柔和的颜色波纹过渡为真实姓名，无需重绘整个列表；
  - **重叠抢话碰撞视觉指示 (Cross-talk Collision Badge)**：
    当 `is_overlap: true` 时，该话轮边缘点亮柔和呼吸警示光晕，并悬挂 `⚡重叠` 徽标；
  - **实时声学控制台 (Acoustic Telemetry)**：
    包含实时麦克风振幅波形（Audio Visualizer）、累计耗时、字数、实时 RTF 与单步延迟。
- **阶段 3：会后纪要分屏看板 (Minutes & Summary Board - `summary`)**
  - **左栏（时间轴对话流水）**：按说话人分段流水，精准物理起止时间戳，支持按参会人维度筛选与搜索；
  - **右栏（高保真结构化纪要）**：包含会议基本信息、核心摘要、议题与决议、带负责人与勾选状态的 Action Items 待办项；支持 Markdown 预览与源文编辑切换、一键复制 Markdown、导出 HTML 与导出 PDF。

---

## 3. 为什么朴素替代方案不可取？

| 方案 | 运作方式 | 致命缺陷 |
| :--- | :--- | :--- |
| **纯追加文本框** | 将所有识别字词追加到单一富文本框 | 无法呈现多说话人交替，无法感知发言起止时间与重叠，可读性极差。 |
| **强行等待声纹后再出字** | 必须等待 2~3 秒声纹计算完成后才渲染对应文字 | 破坏了流式 ASR 的极低首字延迟（300ms），让用户产生“系统卡顿”的负面心理。 |
| **全量会话频繁重构** | 每收到一段新语音就重新请求整个会话列表 | DOM 频繁注销重挂，引发严重页面卡顿、滚动跳跃并打断用户的选中操作。 |
| **单阶段平铺** | 会前、会中、会后都挤在一个控制台 | 界面信息杂乱无章，开会时被无关表单分散注意力，会后又缺乏高效提炼环境。 |

---

## 4. 纯前端状态机与工程参考实现 (Pure Frontend Reference Architecture)

本研究作为纯粹的 UI/UX 交互设计理念与工程参考实现，保持 100% 独立与沙盒化运行，不与任何外部服务进程强行联动：

1. **零损耗数据协议驱动 (Direct Event Protocol Consumption)**：
   - 定义标准的单向 `StreamingMeetingEvent` 数据流契约，既支持兼容扁平字段，亦支持元数据字典嵌套；状态归约器 `processMeetingEvent` 无需任何胶水层即可平滑消费流式事件。
2. **纯函数式归约器解耦 (Zero-Framework Reducer)**：
   - `src/lib/machines.ts` 完全解耦了 React 与 DOM，是一个纯 TypeScript 状态归约库。不仅可在 Web 端使用，亦可直接复用于 React Native、Electron 桌面客户端或原生跨端工程，实现核心交互逻辑的零损耗复现。
3. **内置多场景交互测试用例 (Interactive Scenario Suite)**：
   - `StudyView.tsx` 内置「全流程标准研讨」、「密集抢话碰撞焦点」、「声纹后验平滑更名」等多种典型会话时序场景，支持单步调试、倍速调节与手动抢话注入，便于直观推演极端语音交互场景下的界面韧性与用户体验。

