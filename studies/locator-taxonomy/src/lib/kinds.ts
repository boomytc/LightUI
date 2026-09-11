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
  metric: Localized;
};

export const INTENTS: {
  key: IntentKey;
  index: string;
  title: Localized;
  ask: Localized;
  desc: Localized;
  slugs: PatternSlug[];
}[] = [
  {
    key: "browse",
    index: "01",
    title: loc("连续阅读", "Keep reading"),
    ask: loc("还剩多长？怎么回去？", "How much is left — how do I return?"),
    desc: loc("阅读进度 · 返回顶部", "Reading progress · Back to top"),
    slugs: ["progress", "back-to-top"],
  },
  {
    key: "locate",
    index: "02",
    title: loc("结构跳转", "Jump the outline"),
    ask: loc("去哪一节？现在在哪？", "Which section — where am I?"),
    desc: loc("锚点大纲目录", "Anchor outline TOC"),
    slugs: ["anchor"],
  },
  {
    key: "task",
    index: "03",
    title: loc("阶段与折叠", "Stage and fold"),
    ask: loc("走到哪一步？哪些先收起？", "Which step — what stays folded?"),
    desc: loc("步骤向导 · 折叠面板", "Stepper · Accordion"),
    slugs: ["stepper", "accordion"],
  },
  {
    key: "narrow",
    index: "04",
    title: loc("检索筛选", "Search and slice"),
    ask: loc("只要这些，立刻缩小。", "Only these — shrink the set now."),
    desc: loc("行内检索 · 状态筛选", "In-page search · Status filter"),
    slugs: ["search", "status-filter"],
  },
];

export const PATTERNS: LocatorPattern[] = [
  {
    slug: "progress",
    id: "01",
    name: loc("阅读进度", "Reading Progress"),
    eyebrow: loc("滚动深度 · 完成度", "Scroll depth · Completion"),
    intent: "browse",
    metric: loc("阅读完成度", "Reading completion"),
    purpose: loc(
      "在视口边缘持续反馈阅读深度与剩余篇幅，降低长文不确定感",
      "Keep reading depth at the edge so a long article never feels bottomless",
    ),
    hint: loc("向下滚动长文，底部进度从 0% 推进至 100%，读完仍留驻", "Scroll the essay; the edge bar advances to 100% and stays"),
    coreRule: loc(
      "分母为 scrollHeight - clientHeight；贴边不遮挡正文，读完留驻原点",
      "Denominator is scrollHeight − clientHeight; edge-aligned; stays at 100%",
    ),
  },
  {
    slug: "back-to-top",
    id: "02",
    name: loc("返回顶部", "Back to Top"),
    eyebrow: loc("深层回起点 · 阈值浮现", "Deep recovery · Threshold"),
    intent: "browse",
    metric: loc("回顶阈值", "Return threshold"),
    purpose: loc(
      "让深度浏览后的用户一键返回页面起点，避免重复长距离向上滑动",
      "One tap back to the start after a deep scroll, instead of hauling upward",
    ),
    hint: loc("向下滚动超过 240px 后，右下角平滑浮现回顶按钮", "Scroll past 240px; the return control fades in at the bottom-right"),
    coreRule: loc(
      "滚动超 1.5～2 屏再出现；容器内滚动绝不误听 window；兼容 reduced-motion 即时跳转",
      "Appear after 1.5–2 viewports; listen to the container, not window; snap if reduced-motion",
    ),
  },
  {
    slug: "anchor",
    id: "03",
    name: loc("锚点大纲", "Anchor Outline TOC"),
    eyebrow: loc("侧边目录 · 视口联动", "Sidebar outline · Scrollspy"),
    intent: "locate",
    metric: loc("当前章节", "Current section"),
    purpose: loc(
      "用结构化大纲快速定位长页面中的具体小节，保持上下文全局感知",
      "Jump to a section from a live outline without losing the whole document",
    ),
    hint: loc("点击侧栏小节平滑跳转；滚动时高亮跟着视口走，不会抢跳", "Click a heading to jump; scrollspy follows the viewport and locks during the jump"),
    coreRule: loc(
      "IntersectionObserver 联动；点击跳转期间加锁防抢跳；配置 scroll-margin-top 防遮挡",
      "IntersectionObserver sync; lock during click jumps; scroll-margin-top against sticky chrome",
    ),
  },
  {
    slug: "stepper",
    id: "04",
    name: loc("步骤向导", "Stepper"),
    eyebrow: loc("受控状态机 · 阶段推进", "Controlled machine · Phased steps"),
    intent: "task",
    metric: loc("阶段进度", "Stage index"),
    purpose: loc(
      "将长流程拆解为清晰阶段，同步展示当前步骤、完成进度与下一步约束",
      "Split a long flow into stages with a current step, a trail, and a forward lock",
    ),
    hint: loc("填写后点「下一步」；已完成步可回看，未到的步点不亮", "Advance with Next; completed steps are reviewable; future steps stay locked"),
    coreRule: loc(
      "受控步骤状态机；允许回退已完成步骤，严禁未填项越级向前跳跃",
      "Controlled index; back into completed steps; never skip forward over incomplete ones",
    ),
  },
  {
    slug: "accordion",
    id: "05",
    name: loc("折叠面板", "Accordion"),
    eyebrow: loc("渐进披露 · 标题扫描", "Progressive disclosure · Scannable titles"),
    intent: "task",
    metric: loc("展开条目", "Open item"),
    purpose: loc(
      "默认仅暴露关键标题作为扫描锚点，按需展开细节，防止整页过度摊开",
      "Keep titles as the scan line; open a body only when someone asks",
    ),
    hint: loc("先扫问题标题，再点开一条看答案；高度用网格行过渡", "Scan the questions, then open one; height eases on grid rows, not measured pixels"),
    coreRule: loc(
      "使用 grid-template-rows: 0fr/1fr 实现纯 CSS 平滑展开，无 JS 测量高度抖动",
      "grid-template-rows: 0fr / 1fr — CSS height, no scrollHeight jitter",
    ),
  },
  {
    slug: "search",
    id: "06",
    name: loc("行内检索", "In-page Search"),
    eyebrow: loc("分词加权 · 即时高亮", "Weighted tokens · Live highlight"),
    intent: "narrow",
    metric: loc("检索命中", "Search hits"),
    purpose: loc(
      "用户有明确关键词时，直接输入检索并即时高亮匹配内容",
      "When the query is known, type it — results replace the list and mark the hit",
    ),
    hint: loc("输入「设计」或「定位」，列表换成命中项并高亮原词", "Type 设计 or 定位; the list becomes hits with the query marked"),
    coreRule: loc(
      "标题权重大于标签和正文；输入防抖，空查询平滑回退默认列表，提供空结果指引",
      "Title outranks tags and body; debounce; empty query restores the default list",
    ),
  },
  {
    slug: "status-filter",
    id: "07",
    name: loc("状态筛选", "Status Filter"),
    eyebrow: loc("分面切片 · 实时计数", "Facet slices · Live counts"),
    intent: "narrow",
    metric: loc("可见范围", "Visible slice"),
    purpose: loc(
      "按业务状态切分长列表，附带实时计数，让列表范围变化直观可见",
      "Slice a mixed list by status; counts move with the data so the shrink is visible",
    ),
    hint: loc("切换「进行中」或「已阻塞」；计数跟着变，空切片给出重置", "Switch Doing or Blocked; counts stay true; an empty slice offers a reset"),
    coreRule: loc(
      "受控派生状态；计数与真实数据严格同步；筛选为空时展示对应空状态",
      "Derived slice; counts match the source; empty facet shows an empty state",
    ),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("先定意图", "Name the intent"),
    example: loc("连续阅读、结构跳转、折叠展开，还是检索筛选", "Read, jump, fold, or search and slice"),
  },
  {
    n: "2",
    title: loc("再给定位器", "Then pick the locator"),
    example: loc("进度 / 回顶 / 大纲 / 向导 / 折叠 / 检索 / 分面", "Progress / return / TOC / stepper / fold / search / facet"),
  },
  {
    n: "3",
    title: loc("位置要开口", "Location must speak"),
    example: loc("完成度、阈值、当前节、步骤、展开项、命中、切片计数", "Depth, threshold, section, step, open item, hits, counts"),
  },
  {
    n: "4",
    title: loc("不要一律长滚", "Do not only scroll"),
    example: loc("同一种溢出容器装所有意图，就会迷失", "One overflow for every job is how people get lost"),
  },
];

export const SCENES = [
  {
    scene: loc("20 章文档", "20-chapter docs"),
    naive: loc("盲目滑，找不到约定", "Blind scroll, no section"),
    matched: loc("大纲滚动高亮，一键直达", "Outline + scrollspy jump"),
  },
  {
    scene: loc("长文阅读", "Long read"),
    naive: loc("滚到中间不知还剩多少", "Halfway with no remaining depth"),
    matched: loc("边缘进度 0%–100% 留驻", "Edge progress 0–100%, stays"),
  },
  {
    scene: loc("50 条 FAQ", "50 FAQs"),
    naive: loc("整页摊开，扫描费力", "Everything open, hard to scan"),
    matched: loc("标题先在，按需展开", "Titles first, bodies on demand"),
  },
  {
    scene: loc("混杂状态列表", "Mixed-status list"),
    naive: loc("翻页寻找已结束项", "Page through to find done items"),
    matched: loc("分面计数，一键只看目标", "Facet counts, one tap to the slice"),
  },
];

export function patternBySlug(slug: string): LocatorPattern {
  return PATTERNS.find((p) => p.slug === slug) ?? PATTERNS[0];
}

export function intentByKey(key: IntentKey) {
  return INTENTS.find((i) => i.key === key) ?? INTENTS[0];
}

export function intentOf(slug: PatternSlug) {
  const pat = patternBySlug(slug);
  return intentByKey(pat.intent);
}
