import { loc, type Localized } from "./site-locale";

export type IntentKey = "browse" | "locate" | "task" | "narrow";

export type PatternSlug =
  | "progress"
  | "back-to-top"
  | "anchor"
  | "stepper"
  | "accordion"
  | "search"
  | "status-filter";

export type LocatorPattern = {
  slug: PatternSlug;
  id: string;
  name: Localized;
  eyebrow: Localized;
  intent: IntentKey;
  purpose: Localized;
  hint: Localized;
  coreRule: Localized;
};

export const INTENTS: {
  key: IntentKey;
  title: Localized;
  desc: Localized;
  slugs: PatternSlug[];
}[] = [
  {
    key: "browse",
    title: loc("沉浸浏览", "Immersive Reading"),
    desc: loc("阅读进度 · 返回顶部", "Reading Progress · Back to Top"),
    slugs: ["progress", "back-to-top"],
  },
  {
    key: "locate",
    title: loc("结构定位", "Structural Location"),
    desc: loc("锚点大纲目录", "Anchor Outline TOC"),
    slugs: ["anchor"],
  },
  {
    key: "task",
    title: loc("任务推进 & 披露", "Phased Task & Disclosure"),
    desc: loc("步骤向导 · 折叠面板", "Stepper · Accordion"),
    slugs: ["stepper", "accordion"],
  },
  {
    key: "narrow",
    title: loc("检索 & 缩小范围", "Search & Narrow"),
    desc: loc("行内检索 · 状态筛选", "In-page Search · Status Filter"),
    slugs: ["search", "status-filter"],
  },
];

export const PATTERNS: LocatorPattern[] = [
  {
    slug: "progress",
    id: "01",
    name: loc("阅读进度", "Reading Progress"),
    eyebrow: loc("滚动深度 · 完成度", "Scroll Depth · Completion"),
    intent: "browse",
    purpose: loc(
      "在视口边缘持续反馈阅读深度与剩余篇幅，降低长文不确定感",
      "Continuously feedback reading depth at the edge to reduce uncertainty in long articles",
    ),
    hint: loc("向下滚动长文，底部进度条从 0% 推进至 100%", "Scroll down to see the bottom progress bar advance to 100%"),
    coreRule: loc(
      "分母为 scrollHeight - clientHeight；贴边不遮挡正文，读完留驻原点",
      "Denominator is scrollHeight - clientHeight; edge-aligned without covering text, stays when finished",
    ),
  },
  {
    slug: "back-to-top",
    id: "02",
    name: loc("返回顶部", "Back to Top"),
    eyebrow: loc("深层回起点 · 阈值浮现", "Deep Scroll Recovery · Threshold"),
    intent: "browse",
    purpose: loc(
      "让深度浏览后的用户一键返回页面起点，避免重复长距离向上滑动",
      "Let users return to the start with one click, avoiding tedious manual scrolling",
    ),
    hint: loc("向下滚动超过 280px 后，右下角平滑浮现回顶按钮", "Scroll down >280px to see the button smoothly appear in bottom-right"),
    coreRule: loc(
      "滚动超 1.5～2 屏再出现；容器内滚动绝不误听 window；兼容 reduced-motion 即时跳转",
      "Appear after 1.5–2 viewports; listen to container not window; instant jump for reduced-motion",
    ),
  },
  {
    slug: "anchor",
    id: "03",
    name: loc("锚点大纲", "Anchor Outline TOC"),
    eyebrow: loc("侧边目录 · 视口联动", "Sidebar Outline · Scrollspy"),
    intent: "locate",
    purpose: loc(
      "用结构化大纲快速定位长页面中的具体小节，保持上下文全局感知",
      "Use structured TOC to quickly jump to sections while keeping holistic orientation",
    ),
    hint: loc("点击侧边栏各小节平滑跳转，滚动时实时同步高亮当前章节", "Click lateral sections to jump, or scroll to see live scrollspy highlights"),
    coreRule: loc(
      "IntersectionObserver 联动；点击跳转期间加锁防抢跳；配置 scroll-margin-top 防遮挡",
      "IntersectionObserver sync; lock during click jumps; set scroll-margin-top against sticky headers",
    ),
  },
  {
    slug: "stepper",
    id: "04",
    name: loc("步骤向导", "Stepper"),
    eyebrow: loc("受控状态机 · 阶段推进", "Controlled State Machine · Phased Steps"),
    intent: "task",
    purpose: loc(
      "将长流程拆解为清晰阶段，同步展示当前步骤、完成进度与下一步约束",
      "Break long processes into clear stages with explicit step state and sequential constraints",
    ),
    hint: loc("填写表单后点击「下一步」，步骤条同步高亮并允许回看", "Fill inputs and click Next; stepper advances and permits reviewing completed steps"),
    coreRule: loc(
      "受控步骤状态机；允许回退已完成步骤，严禁未填项越级向前跳跃",
      "Controlled index; allow going back to completed steps; prohibit jumping forward over incomplete steps",
    ),
  },
  {
    slug: "accordion",
    id: "05",
    name: loc("折叠面板", "Accordion"),
    eyebrow: loc("渐进披露 · 标题扫描", "Progressive Disclosure · Scannable Titles"),
    intent: "task",
    purpose: loc(
      "默认仅暴露关键标题作为扫描锚点，按需展开细节，防止整页过度摊开",
      "Expose only titles by default for fast scanning, expanding details on demand",
    ),
    hint: loc("扫视各条 FAQ 问题，点击即可展开查看答案与标签", "Scan FAQ questions and click to reveal detailed answers and tags"),
    coreRule: loc(
      "使用 grid-template-rows: 0fr/1fr 实现纯 CSS 平滑展开，无 JS 测量高度抖动",
      "Use grid-template-rows: 0fr/1fr for pure CSS smooth transitions without height jitter",
    ),
  },
  {
    slug: "search",
    id: "06",
    name: loc("行内检索", "In-page Search"),
    eyebrow: loc("分词加权 · 即时高亮", "Token Weighted Match · Live Highlight"),
    intent: "narrow",
    purpose: loc(
      "用户有明确关键词时，直接输入检索并即时高亮匹配内容",
      "Instantly retrieve and highlight matching content when users have specific keywords",
    ),
    hint: loc("在输入框输入「设计」或「定位」，即时过滤词条并高亮命中词", "Type keywords to filter entries and see exact query terms highlighted"),
    coreRule: loc(
      "标题权重大于标签和正文；输入防抖，空查询平滑回退默认列表，提供空结果指引",
      "Title matches outrank tags and body; debounce input; return to default list when empty",
    ),
  },
  {
    slug: "status-filter",
    id: "07",
    name: loc("状态筛选", "Status Filter"),
    eyebrow: loc("分面切片 · 实时计数", "Facet Slices · Live Counter"),
    intent: "narrow",
    purpose: loc(
      "按业务状态切分长列表，附带实时计数，让列表范围变化直观可见",
      "Slice long lists by status with real-time counts, making list reductions visible",
    ),
    hint: loc("切换「全部」、「进行中」或「已结束」标签，即时查看不同状态列表", "Switch between status chips to filter items with instant count feedback"),
    coreRule: loc(
      "受控派生状态；计数与真实数据严格同步；筛选为空时展示对应空状态",
      "Controlled derived state; keep counters strictly in sync; show empty state when zero matches",
    ),
  },
];
