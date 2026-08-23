import { loc, type Localized } from "./site-locale";
import type { Category, KindId } from "./machines";

export type KindMeta = {
  id: KindId;
  index: string;
  category: Category;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
  window: Localized;
  headline: Localized;
  sub: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "fill",
    index: "01",
    category: "determinate",
    name: "Smooth fill",
    zh: loc("平滑填充", "Smooth fill"),
    oneLiner: loc("连续字节流，百分比真实可信", "A continuous byte stream; the percent is real"),
    scenes: [loc("上传", "Upload"), loc("下载", "Download"), loc("导入", "Import")],
    rules: [
      loc("transform: scaleX(p)，不要改 width", "transform: scaleX(p), not width"),
      loc("从 0 走到 1，停在完成态", "Walk 0→1 and stop at done"),
      loc("百分比用 tabular-nums", "Percent in tabular-nums"),
    ],
    spec: loc(
      "做一条确定进度的平滑填充。轨道是圆角胶囊，填充用 scaleX 从 0 走到 1，右侧同步百分比。走完停在 100%，不要循环，不要假进度。",
      "A determinate smooth fill. Capsule track, fill with scaleX from 0 to 1, percent on the right. Stop at 100%. Do not loop. Do not fake progress.",
    ),
    note: loc("能算的进度才画百分比。假百分比比转圈更糟。", "Only measurable work gets a percent. A fake percent is worse than a spinner."),
    tells: loc("条在长，数字在走，走完就停", "The bar grows, the number moves, then it stops"),
    window: loc("上传 · brief.pdf", "Upload · brief.pdf"),
    headline: loc("文件上传", "Uploading"),
    sub: loc("brief.pdf · 12.4 MB", "brief.pdf · 12.4 MB"),
  },
  {
    id: "steps",
    index: "02",
    category: "determinate",
    name: "Stage steps",
    zh: loc("阶段步骤", "Stage steps"),
    oneLiner: loc("用户要知道此刻卡在哪一步", "You need to see which step is stuck"),
    scenes: [loc("解析需求", "Parse a brief"), loc("生成页面", "Generate a page"), loc("流水线", "A pipeline")],
    rules: [
      loc("三态：done / active / todo", "Three states: done / active / todo"),
      loc("当前节点开口环，完成打勾", "Active is an open arc; done is a check"),
      loc("不要用一条假百分比条代替", "Do not replace the nodes with a fake bar"),
    ],
    spec: loc(
      "做确定进度的阶段步骤：解析需求 → 生成页面 → 完成。已完成实心对勾，进行中开口环，未开始浅色序号。步骤之间用连线，不要用一条假百分比条代替。",
      "Determinate stage steps: parse → generate → done. Done is a filled check, active is an open arc, todo is a light index. Connect them with a line. Do not fake a percent bar.",
    ),
    note: loc(
      "这里的节点就是工作本身，不是页签鱼骨那种选中模型。",
      "These nodes are the work itself, not a tab-chevron selection model.",
    ),
    tells: loc("看得见卡在哪一步", "You can see which step is active"),
    window: loc("工坊 · 解析需求", "Studio · parse brief"),
    headline: loc("解析需求", "Parsing the brief"),
    sub: loc("分三步走完，不要画假条", "Three steps. No fake bar."),
  },
  {
    id: "circular",
    index: "03",
    category: "determinate",
    name: "Circular percent",
    zh: loc("环形百分比", "Circular percent"),
    oneLiner: loc("完成度本身就是信息，适合仪表盘", "Completeness is the point; a dashboard gauge"),
    scenes: [loc("仪表盘", "Dashboard"), loc("任务完成度", "Task completeness"), loc("本周目标", "Weekly goal")],
    rules: [
      loc("从 12 点起笔，rotate(-90)", "Start at 12 o'clock, rotate(-90)"),
      loc("dashoffset = C * (1-p)", "dashoffset = C * (1-p)"),
      loc("走到 100% 停住，不要继续转", "Stop at 100%; do not keep spinning"),
    ],
    spec: loc(
      "做确定进度的环形百分比。SVG 圆环从 12 点起笔，dashoffset 跟进度，中心显示百分比。走到 100% 停住，不要继续旋转。",
      "A determinate circular percent. SVG ring starts at 12 o'clock, dashoffset follows p, percent in the center. Stop at 100%. Do not keep rotating.",
    ),
    tells: loc("圆环走到百分之百就停", "The ring walks to 100 and stops"),
    window: loc("仪表盘 · 本周完成度", "Dashboard · weekly complete"),
    headline: loc("完成度", "Completeness"),
    sub: loc("圆环走到百分之百", "The ring walks to one hundred"),
  },
  {
    id: "liquid",
    index: "04",
    category: "determinate",
    name: "Liquid fill",
    zh: loc("液体填充", "Liquid fill"),
    oneLiner: loc("体量感比细环更直观", "Volume reads faster than a thin ring"),
    scenes: [loc("容量", "Capacity"), loc("数据大屏", "A data wall"), loc("仪表盘", "Dashboard")],
    rules: [
      loc("液面用 translateY 跟进度", "The level follows p with translateY"),
      loc("波浪用 translateX 循环，不重算 path", "The wave loops with translateX; do not rebuild the path"),
      loc("涨到 100% 停住", "Stop when full"),
    ],
    spec: loc(
      "做确定进度的液体填充。圆形容器里液面用 translateY 上涨，可带轻微波浪，中心显示百分比。涨到 100% 停住。",
      "A determinate liquid fill. The level rises with translateY inside a circle, optional wave, percent in the center. Stop at 100%.",
    ),
    tells: loc("液面上涨，满了就停", "The level rises, then holds when full"),
    window: loc("仪表盘 · 容量", "Dashboard · capacity"),
    headline: loc("容量", "Capacity"),
    sub: loc("液面随进度上涨", "The level follows progress"),
  },
  {
    id: "spin",
    index: "05",
    category: "indeterminate",
    name: "Loop spin",
    zh: loc("循环同步", "Loop spin"),
    oneLiner: loc("持续刷新、时长未知", "A refresh with no ETA"),
    scenes: [loc("同步", "Sync"), loc("刷新", "Refresh"), loc("后台对齐", "Background align")],
    rules: [
      loc("开口弧旋转，不要百分比", "An open arc rotates; no percent"),
      loc("不要走向 100%", "Do not walk toward 100%"),
      loc("点完成才停", "It loops until it is finished"),
    ],
    spec: loc(
      "做不确定进度的循环同步。开口圆弧无限旋转，不要百分比，不要走向 100%。配一句「正在同步数据」。",
      "An indeterminate loop spin. An open arc rotates forever. No percent. Do not walk to 100%. Pair it with “Syncing data”.",
    ),
    note: loc("不确定进度不要画假百分比。", "Do not draw a fake percent on unmeasurable work."),
    tells: loc("还在转，就是还在干活", "If it is still turning, it is still working"),
    window: loc("云端 · 同步", "Cloud · sync"),
    headline: loc("正在同步数据", "Syncing data"),
    sub: loc("云端资料与本地状态保持一致", "Cloud files stay aligned with local state"),
  },
  {
    id: "radar",
    index: "06",
    category: "indeterminate",
    name: "Radar sweep",
    zh: loc("雷达扫描", "Radar sweep"),
    oneLiner: loc("扫描、探测，比转圈更有检测感", "A probe, not a generic spinner"),
    scenes: [loc("扫描设备", "Scan devices"), loc("搜索附近", "Search nearby"), loc("探测", "Probe")],
    rules: [
      loc("同心圆加 conic 扇区", "Concentric rings plus a conic sector"),
      loc("只动 rotate，不要每帧重绘扇区", "Only rotate; do not redraw the sector"),
      loc("不要做成普通转圈", "Not a generic spinner"),
    ],
    spec: loc(
      "做不确定进度的雷达扫描。同心圆加旋转 conic 扇区，中心一个圆点，无限循环。不要百分比，不要做成普通转圈。",
      "An indeterminate radar sweep. Concentric rings, a rotating conic sector, a center dot, looping. No percent. Not a generic spinner.",
    ),
    note: loc("不确定进度不要画假百分比。", "Do not draw a fake percent on unmeasurable work."),
    tells: loc("扇区在扫，不是普通转圈", "A sector is sweeping, not a spinner"),
    window: loc("附近 · 扫描设备", "Nearby · scan devices"),
    headline: loc("正在扫描设备", "Scanning for devices"),
    sub: loc("持续搜索附近可用设备", "Still searching nearby"),
  },
  {
    id: "dots",
    index: "07",
    category: "indeterminate",
    name: "Bounce dots",
    zh: loc("三点跳动", "Bounce dots"),
    oneLiner: loc("短时等待的社交习惯用法，比转圈更轻", "A short social wait; lighter than a spinner"),
    scenes: [loc("聊天等待", "Chat wait"), loc("正在回复", "Someone is typing"), loc("短时等待", "A short wait")],
    rules: [
      loc("三点 translateY，delay 错开约 150ms", "Three dots translateY, delays ~150ms apart"),
      loc("不要百分比，不要轨道", "No percent, no track"),
      loc("reduced-motion 时改为静态三点", "Reduced motion: three static dots"),
    ],
    spec: loc(
      "做不确定进度的三点跳动。三个圆点依次上下跳动，循环播放。不要百分比，不要进度条轨道。",
      "Indeterminate bounce dots. Three dots bounce in turn and loop. No percent. No progress track.",
    ),
    note: loc("不确定进度不要画假百分比。", "Do not draw a fake percent on unmeasurable work."),
    tells: loc("三点在跳，就是还在回", "If the dots bounce, a reply is still coming"),
    window: loc("对话", "Chat"),
    headline: loc("对方正在回复", "They are typing"),
    sub: loc("适合聊天与短时等待", "For chat and a short wait"),
  },
  {
    id: "wave",
    index: "08",
    category: "indeterminate",
    name: "Audio wave",
    zh: loc("音频波纹", "Audio wave"),
    oneLiner: loc("波形在变 = 声音在被听见", "A moving waveform means the voice is heard"),
    scenes: [loc("识别语音", "Speech to text"), loc("录音", "Recording"), loc("听写", "Dictation")],
    rules: [
      loc("竖条 scaleY，origin 在中", "Bars scaleY, origin at the center"),
      loc("错开 duration 和 delay", "Stagger duration and delay"),
      loc("不要用 height 动画，不要静态喇叭", "Do not animate height; not a static speaker"),
    ],
    spec: loc(
      "做不确定进度的音频波纹。五根圆角竖条用 scaleY 起伏、错开节拍，循环播放。不要百分比，不要做成静态音量图标。",
      "An indeterminate audio wave. Five rounded bars scaleY on staggered beats and loop. No percent. Not a static volume icon.",
    ),
    note: loc("不确定进度不要画假百分比。", "Do not draw a fake percent on unmeasurable work."),
    tells: loc("波形在变，声音还在", "If the wave moves, the voice is still in"),
    window: loc("语音 · 识别", "Voice · recognize"),
    headline: loc("正在识别语音", "Listening to speech"),
    sub: loc("波形随声音持续变化", "The wave keeps changing with the voice"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("能不能算", "Measurable?"),
    example: loc("能算就走到 100 停住；不能算就循环", "If it can be measured, walk to 100 and stop; if not, loop"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("上传、分步解析、仪表盘、同步、扫描、聊天、语音", "Upload, parse steps, dashboard, sync, scan, chat, voice"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("scaleX、三态节点、dashoffset、液面、开口弧、雷达扇区", "scaleX, three-state nodes, dashoffset, liquid, open arc, radar"),
  },
];

export const PARSE_STEPS = [
  { zh: "解析需求", en: "Parse", shortZh: "解析", shortEn: "Parse" },
  { zh: "生成页面", en: "Generate", shortZh: "生成", shortEn: "Build" },
  { zh: "完成", en: "Done", shortZh: "完成", shortEn: "Done" },
] as const;
