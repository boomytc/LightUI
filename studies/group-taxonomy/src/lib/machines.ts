export const PATTERN_IDS = [
  "overview",
  "cards",
  "whitespace",
  "form",
  "list",
  "bands",
  "compare",
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];
export type GroupMode = "cards" | "grouped";

export function isPatternId(value: unknown): value is PatternId {
  return typeof value === "string" && (PATTERN_IDS as readonly string[]).includes(value);
}

export type PatternMeta = {
  id: Exclude<PatternId, "overview">;
  num: string;
  name: string;
  en: string;
  relation: string;
  purpose: string;
  scenes: string[];
  rule: string;
  css: string;
  prompt: string;
};

export const PATTERNS: PatternMeta[] = [
  {
    id: "cards",
    num: "00",
    name: "默认卡片",
    en: "Card Default",
    relation: "安全捷径（对照基准）",
    purpose: "识别内容块后先套框，再补圆角、边框和阴影",
    scenes: ["看板拖拽卡", "收藏夹单品", "独立实体"],
    rule: "卡片只该装真正独立、可被单独拿起的对象。标题、指标、介绍如果只是同一页面上的连续段落，不必各套一张卡。",
    css: `.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 1.25rem;
}
/* 过于安全，容易把连续叙述切成便利贴墙 */`,
    prompt: "不要把每个模块默认装进带圆角、边框、阴影的卡片。先判断内容关系，再选择留白、表单分组、单列列表、通栏色块或竖向分割线。",
  },
  {
    id: "whitespace",
    num: "01",
    name: "留白分区",
    en: "Whitespace Sections",
    relation: "上下承接",
    purpose: "用垂直节奏分开上下承接的内容，不靠框",
    scenes: ["介绍页", "详情页", "长文叙述"],
    rule: "内容沿阅读顺序自然推进时，留白和细分割线就足够了。外框会把连续叙述切成互不相关的贴纸。",
    css: `.section + .section {
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--color-border);
}
.kicker {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
/* 不需要 background / radius / shadow */`,
    prompt: "这段是上下承接的阅读内容。用留白和细分割线建立节奏，不要给每一段加卡片边框、圆角或阴影。",
  },
  {
    id: "form",
    num: "02",
    name: "表单分组",
    en: "Form Sections",
    relation: "同一填写任务",
    purpose: "把字段按填写任务自然组织成大区",
    scenes: ["注册流程", "个人资料", "团队设置"],
    rule: "基本信息放一起，工作信息放一起。字段是任务里的输入格子，不是一张张独立卡片。",
    css: `.form-block + .form-block {
  margin-top: 1.75rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--color-border);
}
.form-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem 1.5rem;
}
.field input {
  border: 0;
  border-bottom: 1px solid var(--color-border-strong);
  border-radius: 0;
  background: transparent;
}`,
    prompt: "这是一组要填写的资料。按任务分组：基本信息一区、工作信息一区。每个输入框采用扁平下划线，不要单独套卡片。",
  },
  {
    id: "list",
    num: "03",
    name: "单列列表",
    en: "Activity Feed",
    relation: "连续发生",
    purpose: "让连续事件沿单一路径快速扫过",
    scenes: ["消息通知", "审计日志", "项目动态流"],
    rule: "消息与动态是时间线上的节点。一张卡一个事件会强迫视线在网格间跳跃，单列列表让视线顺一条路径扫下。",
    css: `.feed-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding-block: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}
.feed-row:hover { background: var(--color-border); }
/* 单列对齐是唯一的分组提示，不要给行加圆角卡片 */`,
    prompt: "这些是连续发生的消息/记录/动态。排成单列列表，让视线沿一条路径扫下。不要把每条事件做成独立卡片。",
  },
  {
    id: "bands",
    num: "04",
    name: "通栏色块",
    en: "Color Bands",
    relation: "整行同主题",
    purpose: "用整行背景色带建立不同内容区域",
    scenes: ["功能段落", "专题功能区", "行动号召区"],
    rule: "同一主题的一组入口共享一条色带。背景色是区域边界，不必给行内每一项单独套卡片。",
    css: `.band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-md);
}
.band-a { background: var(--color-band-a); }
.band-b { background: var(--color-band-b); }
.band-c { background: var(--color-band-c); }
.band-item { background: transparent; border: 0; }`,
    prompt: "整行内容属于同一个主题。用通栏色块建立区域，行内项目保持无框纯扁平。不要给每一项单独套卡片。",
  },
  {
    id: "compare",
    num: "05",
    name: "竖向分割线",
    en: "Price Comparison",
    relation: "并列比较",
    purpose: "多款产品沿列直接横向比较参数与价格",
    scenes: ["套餐定价", "产品版本", "服务阶梯对比"],
    rule: "要并排看差异时，细竖线标明栏目边界，页面仍是一张整表。独立卡片会把横向对齐切碎。",
    css: `.plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.plan {
  padding: 1.5rem 1.25rem;
  background: transparent;
}
.plan + .plan {
  border-inline-start: 1px solid var(--color-border);
}`,
    prompt: "这些内容需要并列比较。用竖向分割线分栏，共享同一背景，不要做成三张互不相关的定价卡片。",
  },
];

export const PATTERN_MAP = Object.fromEntries(
  PATTERNS.map((pattern) => [pattern.id, pattern]),
) as Record<Exclude<PatternId, "overview">, PatternMeta>;

export const NAV_ITEMS: { id: PatternId; label: string; num?: string }[] = [
  { id: "overview", label: "概览" },
  { id: "cards", label: "默认卡片", num: "00" },
  { id: "whitespace", label: "留白分区", num: "01" },
  { id: "form", label: "表单分组", num: "02" },
  { id: "list", label: "单列列表", num: "03" },
  { id: "bands", label: "通栏色块", num: "04" },
  { id: "compare", label: "竖向分割线", num: "05" },
];

export const MASTER_PROMPT = `设计页面时先判断内容关系，再选择分组方式。禁止把每个模块默认装进带圆角、边框、阴影的卡片。

规则：
1. 上下承接的阅读内容（介绍、详情、长文）：用留白和细分割线建立节奏，不要每段加框。
2. 同一填写任务（注册、资料、设置）：按任务分组表单字段（如基本信息 / 工作信息），字段本身不要各自套卡片。
3. 连续发生的信息（消息、记录、动态）：用单列列表，让视线沿一条路径扫过。
4. 整行同主题的功能区：用通栏色块建立区域，不要给每一项单独套卡片。
5. 需要并列比较的内容（套餐、版本、服务）：用竖向分割线分栏，保留整体，不要切成三张独立卡。

卡片只用于真正独立、可被单独拿起操作的对象（如一张可拖拽的任务卡、一张可收藏的条目）。关系才是分组答案。`;

export type QuizItem = {
  id: string;
  scene: string;
  answer: Exclude<PatternId, "overview" | "cards">;
  why: string;
};

export const QUIZ: QuizItem[] = [
  {
    id: "q1",
    scene: "产品介绍里有「为什么重做 / 怎么解决 / 最终改变」三段，顺着读下去。",
    answer: "whitespace",
    why: "三段是上下承接的叙述，留白和细线就能分开节奏。加框会让它们看起来像三条互不相关的功能。",
  },
  {
    id: "q2",
    scene: "完善账号：姓名、邮箱、手机，以及团队、职位、城市，都要一次性填完。",
    answer: "form",
    why: "这是同一填写任务。按基本信息 / 工作信息分组，字段是网格中的格子，不是六张卡。",
  },
  {
    id: "q3",
    scene: "工作台要展示最近 12 条项目动态：更新、反馈、归档、权限调整。",
    answer: "list",
    why: "动态是连续发生的。单列列表让视线顺一条路径扫过，卡片会强迫眼睛在网格间跳跃。",
  },
  {
    id: "q4",
    scene: "协作页有沟通、进度、资料三大主题，每个主题下三个入口。",
    answer: "bands",
    why: "整行同主题。一条色带就是一个区域，不必给九个入口各套一张卡。",
  },
  {
    id: "q5",
    scene: "三个套餐 Starter / Pro / Team，用户要并排比较价格、席位和导出能力。",
    answer: "compare",
    why: "并列比较靠对齐和细竖线。独立卡片会把同一张表切碎，差异反而更难看清。",
  },
];

export const STEPS = [
  {
    num: "01",
    title: "识别内容块",
    body: "标题、指标、介绍看起来彼此独立。",
  },
  {
    num: "02",
    title: "自动容器化",
    body: "先用一个框，快速证明它们属于不同分组。",
  },
  {
    num: "03",
    title: "补齐装饰",
    body: "背景、圆角、边框、阴影一起出现，形成便利贴墙。",
  },
];

export function nextPattern(id: PatternId): PatternId {
  const index = PATTERN_IDS.indexOf(id);
  return PATTERN_IDS[(index + 1) % PATTERN_IDS.length] ?? "overview";
}

export function prevPattern(id: PatternId): PatternId {
  const index = PATTERN_IDS.indexOf(id);
  return PATTERN_IDS[(index - 1 + PATTERN_IDS.length) % PATTERN_IDS.length] ?? "overview";
}

export function gradeQuizAnswer(
  quizId: string,
  chosen: Exclude<PatternId, "overview" | "cards">,
): { correct: boolean; why: string; expected: Exclude<PatternId, "overview" | "cards"> } | null {
  const item = QUIZ.find((q) => q.id === quizId);
  if (!item) return null;
  return {
    correct: item.answer === chosen,
    why: item.why,
    expected: item.answer,
  };
}
