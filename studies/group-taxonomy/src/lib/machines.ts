import { loc, type Localized } from "./site-locale.js";

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
  name: Localized;
  en: string;
  relation: Localized;
  purpose: Localized;
  scenes: Localized[];
  rule: Localized;
  cut: Localized;
  when: Localized;
  css: string;
  prompt: Localized;
};

export const PATTERNS: PatternMeta[] = [
  {
    id: "cards",
    num: "00",
    name: loc("默认卡片", "Card Default"),
    en: "Card Default",
    relation: loc("安全捷径（对照基准）", "Safe shortcut (baseline)"),
    purpose: loc(
      "识别内容块后先套框，再补圆角、边框和阴影",
      "Wrap every content block in a box with radius, border, and shadow",
    ),
    scenes: [
      loc("看板拖拽卡", "Draggable board cards"),
      loc("收藏夹单品", "Saved standalone items"),
      loc("独立实体", "Independent entities"),
    ],
    rule: loc(
      "卡片只该装真正独立、可被单独拿起的对象。标题、指标、介绍如果只是同一页面上的连续段落，不必各套一张卡。",
      "Cards belong around truly independent objects that can be picked up on their own. Headings, metrics, and prose in one flow do not each need a card.",
    ),
    cut: loc("圆角 + 阴影", "Radius + shadow"),
    when: loc("对象可单独拿起", "Items stand alone"),
    css: `.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 1.25rem;
}
/* Safe default, but turns continuous narrative into a sticky-note wall */`,
    prompt: loc(
      "不要把每个模块默认装进带圆角、边框、阴影的卡片。先判断内容关系，再选择留白、表单分组、单列列表、通栏色块或竖向分割线。",
      "Do not wrap every block in a rounded, bordered, shadowed card by default. Name the content relationship first, then pick whitespace, form sections, a single-column list, color bands, or vertical dividers.",
    ),
  },
  {
    id: "whitespace",
    num: "01",
    name: loc("留白分区", "Whitespace Sections"),
    en: "Whitespace Sections",
    relation: loc("上下承接", "Sequential narrative"),
    purpose: loc(
      "用垂直节奏分开上下承接的内容，不靠框",
      "Separate consecutive prose with vertical rhythm instead of boxes",
    ),
    scenes: [
      loc("介绍页", "Overview pages"),
      loc("详情页", "Detail pages"),
      loc("长文叙述", "Longform essays"),
    ],
    rule: loc(
      "内容沿阅读顺序自然推进时，留白和细分割线就足够了。外框会把连续叙述切成互不相关的贴纸。",
      "When sections progress in reading order, whitespace and hairline rules are enough. Boxes slice a single story into unrelated stickers.",
    ),
    cut: loc("间距 + 细线", "Space + hairline"),
    when: loc("内容顺着读下去", "Read top to bottom"),
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
/* No background / radius / shadow needed */`,
    prompt: loc(
      "这段是上下承接的阅读内容。用留白和细分割线建立节奏，不要给每一段加卡片边框、圆角或阴影。",
      "These blocks form a top-to-bottom narrative. Use vertical spacing and hairlines for rhythm; do not add card borders, radius, or shadows to each section.",
    ),
  },
  {
    id: "form",
    num: "02",
    name: loc("表单分组", "Form Sections"),
    en: "Form Sections",
    relation: loc("同一填写任务", "Single input task"),
    purpose: loc(
      "把字段按填写任务自然组织成大区",
      "Organize related inputs under section headings in one flow",
    ),
    scenes: [
      loc("注册流程", "Sign-up flows"),
      loc("个人资料", "Profile settings"),
      loc("团队设置", "Team configuration"),
    ],
    rule: loc(
      "基本信息放一起，工作信息放一起。字段是任务里的输入格子，不是一张张独立卡片。",
      "Keep basic info together and work info together. Fields are cells inside one task, not individual cards.",
    ),
    cut: loc("标题分区", "Section headings"),
    when: loc("同一任务一次填完", "Completed in one pass"),
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
    prompt: loc(
      "这是一组要填写的资料。按任务分组：基本信息一区、工作信息一区。每个输入框采用扁平下划线，不要单独套卡片。",
      "These fields belong to one form task. Group them under clear section headings (Basic Info / Work Info) with flat underline inputs—do not wrap individual fields in cards.",
    ),
  },
  {
    id: "list",
    num: "03",
    name: loc("单列列表", "Activity Feed"),
    en: "Activity Feed",
    relation: loc("连续发生", "Chronological stream"),
    purpose: loc(
      "让连续事件沿单一路径快速扫过",
      "Let sequential events scan smoothly down one vertical track",
    ),
    scenes: [
      loc("消息通知", "Notifications"),
      loc("审计日志", "Audit logs"),
      loc("项目动态流", "Activity feeds"),
    ],
    rule: loc(
      "消息与动态是时间线上的节点。一张卡一个事件会强迫视线在网格间跳跃，单列列表让视线顺一条路径扫下。",
      "Events happen along one timeline. Putting each event in a grid card forces eye zig-zags; a single-column list gives one clean scan path.",
    ),
    cut: loc("行分割", "Row hairlines"),
    when: loc("事件沿时间连续发生", "Events arrive over time"),
    css: `.feed-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding-block: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}
.feed-row:hover { background: var(--color-border); }
/* Single-column alignment is the grouping cue; no per-row cards */`,
    prompt: loc(
      "这些是连续发生的消息/记录/动态。排成单列列表，让视线沿一条路径扫下。不要把每条事件做成独立卡片。",
      "These are sequential messages/events. Lay them out as a single-column list with row dividers for fast scanning; do not turn each event into a card.",
    ),
  },
  {
    id: "bands",
    num: "04",
    name: loc("通栏色块", "Color Bands"),
    en: "Color Bands",
    relation: loc("整行同主题", "Row-wide theme"),
    purpose: loc(
      "用整行背景色带建立不同内容区域",
      "Use full-width tinted bands to separate thematic zones",
    ),
    scenes: [
      loc("功能段落", "Feature zones"),
      loc("专题功能区", "Thematic hubs"),
      loc("行动号召区", "Callout bands"),
    ],
    rule: loc(
      "同一主题的一组入口共享一条色带。背景色是区域边界，不必给行内每一项单独套卡片。",
      "Items sharing a theme live on one tinted band. The band itself marks the boundary, so inner items stay unboxed.",
    ),
    cut: loc("通栏色带", "Full-width band"),
    when: loc("整行同属一个主题", "Whole row shares a topic"),
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
    prompt: loc(
      "整行内容属于同一个主题。用通栏色块建立区域，行内项目保持无框纯扁平。不要给每一项单独套卡片。",
      "Each row belongs to one topic. Use full-width tinted bands for zones and keep items inside flat without individual card boxes.",
    ),
  },
  {
    id: "compare",
    num: "05",
    name: loc("竖向分割线", "Price Comparison"),
    en: "Price Comparison",
    relation: loc("并列比较", "Side-by-side comparison"),
    purpose: loc(
      "多款产品沿列直接横向比较参数与价格",
      "Compare parallel options directly across shared columns",
    ),
    scenes: [
      loc("套餐定价", "Pricing tiers"),
      loc("产品版本", "Product editions"),
      loc("服务阶梯对比", "Service comparisons"),
    ],
    rule: loc(
      "要并排看差异时，细竖线标明栏目边界，页面仍是一张整表。独立卡片会把横向对齐切碎。",
      "When comparing attributes side by side, hairline vertical rules keep columns aligned on one shared surface instead of breaking alignment into isolated cards.",
    ),
    cut: loc("竖向细线", "Vertical rules"),
    when: loc("要并排比较参数", "Comparing specs across"),
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
    prompt: loc(
      "这些内容需要并列比较。用竖向分割线分栏，共享同一背景，不要做成三张互不相关的定价卡片。",
      "These tiers are meant for side-by-side comparison. Place them on one shared surface separated by vertical hairlines instead of three disconnected cards.",
    ),
  },
];

export const PATTERN_MAP = Object.fromEntries(
  PATTERNS.map((pattern) => [pattern.id, pattern]),
) as Record<Exclude<PatternId, "overview">, PatternMeta>;

export const MASTER_PROMPT: Localized = loc(
  `设计页面时先判断内容关系，再选择分组方式。禁止把每个模块默认装进带圆角、边框、阴影的卡片。

规则：
1. 上下承接的阅读内容（介绍、详情、长文）：用留白和细分割线建立节奏，不要每段加框。
2. 同一填写任务（注册、资料、设置）：按任务分组表单字段（如基本信息 / 工作信息），字段本身不要各自套卡片。
3. 连续发生的信息（消息、记录、动态）：用单列列表，让视线沿一条路径扫过。
4. 整行同主题的功能区：用通栏色块建立区域，不要给每一项单独套卡片。
5. 需要并列比较的内容（套餐、版本、服务）：用竖向分割线分栏，保留整体，不要切成三张独立卡。

卡片只用于真正独立、可被单独拿起操作的对象（如一张可拖拽的任务卡、一张可收藏的条目）。关系才是分组答案。`,
  `Determine the semantic relationship before choosing a grouping container. Never default to wrapping every block in a rounded, bordered, shadowed card.

Rules:
1. Sequential narrative (overviews, details, longform): use whitespace and hairline rules; do not box every section.
2. One form task (sign-up, profile, settings): group fields under task headings (Basic Info / Work Info); keep individual fields unboxed.
3. Chronological stream (messages, logs, activity): use a single-column list so the eye scans down one track.
4. Row-wide thematic zones: use full-width tinted color bands and leave inner items flat.
5. Side-by-side comparison (plans, tiers, specs): divide columns with vertical hairlines on one shared surface.

Reserve cards for truly independent objects that can be picked up on their own (a draggable task card, a saved item). Relationship decides the container.`,
);

export type QuizItem = {
  id: string;
  scene: Localized;
  answer: Exclude<PatternId, "overview" | "cards">;
  why: Localized;
};

export const QUIZ: QuizItem[] = [
  {
    id: "q1",
    scene: loc(
      "产品介绍里有「为什么重做 / 怎么解决 / 最终改变」三段，顺着读下去。",
      "A product page has three sequential sections: Why / How / Result, meant to be read top to bottom.",
    ),
    answer: "whitespace",
    why: loc(
      "三段是上下承接的叙述，留白和细线就能分开节奏。加框会让它们看起来像三条互不相关的功能。",
      "They form one top-to-bottom narrative. Whitespace and hairlines set the pace without slicing them into unrelated stickers.",
    ),
  },
  {
    id: "q2",
    scene: loc(
      "完善账号：姓名、邮箱、手机，以及团队、职位、城市，都要一次性填完。",
      "Account setup asks for Name, Email, Phone plus Team, Role, City in a single submission.",
    ),
    answer: "form",
    why: loc(
      "这是同一填写任务。按基本信息 / 工作信息分组，字段是网格中的格子，不是六张卡。",
      "It is one input task. Group by Basic Info / Work Info with flat fields instead of six separate cards.",
    ),
  },
  {
    id: "q3",
    scene: loc(
      "工作台要展示最近 12 条项目动态：更新、反馈、归档、权限调整。",
      "A workspace shows the latest 12 project updates: edits, feedback, archives, and permission changes.",
    ),
    answer: "list",
    why: loc(
      "动态是连续发生的。单列列表让视线顺一条路径扫过，卡片会强迫眼睛在网格间跳跃。",
      "Events arrive chronologically. A single-column list creates one clear vertical scan line instead of grid zig-zags.",
    ),
  },
  {
    id: "q4",
    scene: loc(
      "协作页有沟通、进度、资料三大主题，每个主题下三个入口。",
      "A collaboration hub has three themes—Chat, Progress, Docs—with three entry points under each.",
    ),
    answer: "bands",
    why: loc(
      "整行同主题。一条色带就是一个区域，不必给九个入口各套一张卡。",
      "Each row shares one theme. A tinted band defines the zone so the nine links stay clean and unboxed.",
    ),
  },
  {
    id: "q5",
    scene: loc(
      "三个套餐 Starter / Pro / Team，用户要并排比较价格、席位和导出能力。",
      "Three tiers—Starter, Pro, Team—where users compare price, seats, and export limits side by side.",
    ),
    answer: "compare",
    why: loc(
      "并列比较靠对齐和细竖线。独立卡片会把同一张表切碎，差异反而更难看清。",
      "Side-by-side comparison relies on horizontal alignment and vertical rules. Separate cards fracture the table.",
    ),
  },
];

export const STEPS = [
  {
    num: "01",
    title: loc("识别内容块", "Spot content blocks"),
    body: loc(
      "标题、指标、介绍看起来彼此独立。",
      "Headings, metrics, and descriptions look separable at a glance.",
    ),
  },
  {
    num: "02",
    title: loc("自动容器化", "Auto-box everything"),
    body: loc(
      "先用一个框，快速证明它们属于不同分组。",
      "Drop a box around each block as the fastest proof of grouping.",
    ),
  },
  {
    num: "03",
    title: loc("补齐装饰", "Stack chrome"),
    body: loc(
      "背景、圆角、边框、阴影一起出现，形成便利贴墙。",
      "Background, radius, border, and shadow pile up into a sticky-note wall.",
    ),
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
): { correct: boolean; why: Localized; expected: Exclude<PatternId, "overview" | "cards"> } | null {
  const item = QUIZ.find((q) => q.id === quizId);
  if (!item) return null;
  return {
    correct: item.answer === chosen,
    why: item.why,
    expected: item.answer,
  };
}
