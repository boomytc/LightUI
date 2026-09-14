import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type { KindId };

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
  css: string;
  wrongCss: string;
  wrongHint: Localized;
  rightHint: Localized;
  wrongCaption: Localized;
  rightCaption: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "baseline",
    index: "01",
    name: "Baseline",
    zh: loc("基线", "Baseline"),
    oneLiner: loc("大小字按文字基线，不是外框", "Mixed type sits on the baseline, not the box"),
    scenes: [
      loc("价格和单位", "Price and unit"),
      loc("数字和标注", "A figure and its label"),
      loc("大标题旁的补充", "A kicker beside a display"),
    ],
    rules: [
      loc("align-items: baseline", "align-items: baseline"),
      loc("不要用 items-center 对 margin box", "Do not items-center the margin box"),
      loc("字号一变，基线仍是同一条线", "When the size changes, the baseline stays one line"),
    ],
    spec: loc(
      "大小字并排按文字基线对齐，使用 align-items: baseline，不要按外框用 items-center。",
      "Sit mixed type on the text baseline with align-items: baseline. Do not items-center the margin boxes.",
    ),
    note: loc("基线是字形坐的那条线。外框中线不是。", "The baseline is where the glyphs sit. The box midline is not."),
    tells: loc("「128」和「元/月」坐在同一条线上", "“128” and “/mo” share one line"),
    css: `display: flex;
align-items: baseline;
gap: 0.35em;`,
    wrongCss: `display: flex;
align-items: center;
gap: 0.35em;`,
    wrongHint: loc("外框中线", "Box midline"),
    rightHint: loc("文字基线", "Text baseline"),
    wrongCaption: loc("items-center 对的是 margin box", "items-center lines up margin boxes"),
    rightCaption: loc("大小字坐在同一条基线上", "Mixed type sits on one baseline"),
  },
  {
    id: "cover",
    index: "02",
    name: "Cover",
    zh: loc("封面", "Cover"),
    oneLiner: loc("cover 填满，焦点跟着主体", "Fill with cover; the focus follows the subject"),
    scenes: [
      loc("卡片头图", "A card hero"),
      loc("竖图裁成方", "A tall crop to square"),
      loc("人物在画面下方", "A figure at the bottom of the frame"),
    ],
    rules: [
      loc("object-fit: cover 填满，不要 contain 留空", "object-fit: cover fills; contain letterboxes"),
      loc("object-position 跟着主体，例如 50% 88%", "object-position follows the subject, e.g. 50% 88%"),
      loc("默认 50% 50% 会把不在中心的主体切走", "Default 50% 50% crops a subject that is not centered"),
    ],
    spec: loc(
      "封面用 object-fit: cover 填满容器。主体不在正中时，把 object-position 写到主体上（例如 50% 88%），不要 contain 留空，也不要默认 50% 50%。",
      "Fill the cover with object-fit: cover. When the subject is not centered, put object-position on it (e.g. 50% 88%). Do not letterbox with contain, and do not keep 50% 50%.",
    ),
    note: loc("contain 的空带看起来像裁偏了。cover 仍要点焦点。", "Contain’s empty bands look like a bad crop. Cover still needs a focal point."),
    tells: loc("画面填满，人还在", "The frame is full and the figure is still there"),
    css: `width: 100%;
height: 100%;
object-fit: cover;
object-position: 50% 88%;`,
    wrongCss: `object-fit: contain;
object-position: 50% 50%;`,
    wrongHint: loc("留空 · 画面中心", "Letterbox · center"),
    rightHint: loc("填满 · 主体焦点", "Fill · subject"),
    wrongCaption: loc("contain 留空，看起来像裁偏了", "Contain letterboxes and looks off"),
    rightCaption: loc("cover 填满，焦点停在 50% 88%", "Cover fills; focus stays at 50% 88%"),
  },
  {
    id: "axis",
    index: "03",
    name: "Axis",
    zh: loc("交叉轴", "Axis"),
    oneLiner: loc("图标和文字：交叉轴垂直居中", "Icon and label: cross-axis center"),
    scenes: [
      loc("导航一项", "A nav row"),
      loc("列表行", "A list row"),
      loc("按钮里的图标", "An icon in a button"),
    ],
    rules: [
      loc("同一行用 flex", "One row is flex"),
      loc("交叉轴 align-items: center", "Cross axis: align-items: center"),
      loc("说清轴，不要只说「对齐」", "Name the axis; do not just say “align it”"),
    ],
    spec: loc(
      "图标和文字同一行时垂直居中：display: flex; align-items: center。说清交叉轴，不要含糊说对齐。",
      "Icon and label on one row: display: flex; align-items: center. Name the cross axis. Do not say “align it.”",
    ),
    note: loc("交叉轴居中对齐的是盒子。大小字要基线。", "Cross-axis center aligns boxes. Mixed type wants the baseline."),
    tells: loc("图标中线和文字中线重合", "The icon midline meets the label midline"),
    css: `display: flex;
align-items: center;
gap: 0.75rem;`,
    wrongCss: `display: flex;
/* 没写交叉轴 */
gap: 0.75rem;`,
    wrongHint: loc("没写交叉轴", "No cross axis"),
    rightHint: loc("交叉轴居中", "Cross-axis center"),
    wrongCaption: loc("图标贴着第一行顶", "The icon hugs the first line"),
    rightCaption: loc("图标中线与文字中线重合", "Icon and label midlines meet"),
  },
  {
    id: "margin",
    index: "04",
    name: "Gap",
    zh: loc("间距", "Gap"),
    oneLiner: loc("间距用 gap，不要随机 margin 目测", "Space with gap, not leftover margin by eye"),
    scenes: [
      loc("卡片叠放", "A stack of cards"),
      loc("表单字段", "Form fields"),
      loc("标题和正文", "Title and body"),
    ],
    rules: [
      loc("父级用 gap", "The parent owns gap"),
      loc("子孙 margin: 0", "Children: margin: 0"),
      loc("不要靠标签默认外边距凑缝", "Do not lean on user-agent margin"),
    ],
    spec: loc(
      "间距只用父级 gap。先把标题、段落、列表的默认 margin 归零，不要随机 margin 目测。",
      "Space with the parent’s gap. Zero heading, paragraph, and list margin first. Do not judge leftover margin by eye.",
    ),
    note: loc("那截去不掉的缝，通常是子孙还留着 margin。", "The seam you cannot kill is usually a child’s leftover margin."),
    tells: loc("缝是一条，不是每项自己留", "One seam, not a margin on every item"),
    css: `display: flex;
flex-direction: column;
gap: 1rem;

h1, p, ul, figure {
  margin: 0;
}`,
    wrongCss: `.card + .card { margin-top: 18px; }
.card:last-child { margin-top: 7px; }`,
    wrongHint: loc("随机 margin", "Leftover margin"),
    rightHint: loc("父级一条 gap", "One parent gap"),
    wrongCaption: loc("18px 和 7px，缝对不齐", "18px then 7px — the seam slips"),
    rightCaption: loc("子孙 margin: 0，缝只有一条", "Children margin: 0; one seam"),
  },
  {
    id: "padding",
    index: "05",
    name: "Padding",
    zh: loc("贴边", "Padding"),
    oneLiner: loc("第一行贴边：padding-top 对行高 / 帽高", "First line flush: padding-top from line-height / cap-height"),
    scenes: [
      loc("卡片大标题", "A card display"),
      loc("首屏一句", "A hero line"),
      loc("栏头", "A column head"),
    ],
    rules: [
      loc("量的是帽高到边，不是内容盒顶", "Measure cap to edge, not content-box top"),
      loc("padding-top 减去行高里帽高以上的空", "Subtract extra leading above the cap"),
      loc("左右 inset 与帽高同一条视觉边", "Inline inset and cap share one visual edge"),
    ],
    spec: loc(
      "第一行不要贴着盒子顶。padding-top 按行高和帽高来：calc(var(--inset) - (1lh - 1cap) / 2)，让帽高和左右 inset 对齐。",
      "Do not glue the first line to the top. Size padding-top from line-height and cap-height: calc(var(--inset) - (1lh - 1cap) / 2), so the cap matches the inline inset.",
    ),
    note: loc("几何 padding 相等时，第一行仍可能看起来贴边或空一截。", "Equal geometric padding can still look flush or airy on the first line."),
    tells: loc("帽高和左右边距是同一条缝", "The cap and the side inset are one seam"),
    css: `--inset: 1rem;
padding-top: calc(var(--inset) - (1lh - 1cap) / 2);
padding-inline: var(--inset);
padding-bottom: var(--inset);`,
    wrongCss: `padding: 4px 1rem 1rem;`,
    wrongHint: loc("第一行贴顶", "Flush to the top"),
    rightHint: loc("帽高对 inset", "Cap to inset"),
    wrongCaption: loc("量的是内容盒顶，不是帽高", "Measures content-box top, not the cap"),
    rightCaption: loc("帽高和左右 inset 是同一条缝", "Cap and side inset share one seam"),
  },
  {
    id: "optical",
    index: "06",
    name: "Optical",
    zh: loc("光学", "Optical"),
    oneLiner: loc("视觉居中不是几何中心", "Optical center is not the geometric center"),
    scenes: [
      loc("圆钮里的播放三角", "A play triangle in a round button"),
      loc("圆和方并排", "A circle next to a square"),
      loc("大小字锁在一起", "Mixed type in one lockup"),
    ],
    rules: [
      loc("圆要比同包围盒的方略大", "A circle reads small next to a square of the same box"),
      loc("播放三角略向右移", "Nudge a play triangle right"),
      loc("不要拿包围盒中心当视觉中心", "Do not treat the bounding-box center as the visual center"),
    ],
    spec: loc(
      "视觉居中不是几何中心。圆与方并排时圆略放大；圆钮里的播放三角略向右移。不要按包围盒中心对。",
      "Optical center is not geometric center. Scale a circle up beside a square; nudge a play triangle right inside a round button. Do not use the bounding-box center.",
    ),
    note: loc("光学对齐仍在放盒子，只是不以几何中心为准。", "Optical alignment still places boxes. It refuses the geometric center."),
    tells: loc("眼睛觉得在正中，尺子量着却偏一点", "The eye says center; the ruler is off by a hair"),
    css: `.circle { transform: scale(1.06); }
.play { transform: translateX(8%); }`,
    wrongCss: `.circle, .play { /* 几何正中 */ }`,
    wrongHint: loc("几何中心", "Geometric center"),
    rightHint: loc("视觉质量", "Optical mass"),
    wrongCaption: loc("圆显小，三角看起来偏左", "The circle reads small; the triangle sits left"),
    rightCaption: loc("圆略放大，三角略右移", "Scale the circle; nudge the triangle right"),
  },
  {
    id: "inset",
    index: "07",
    name: "Inset",
    zh: loc("嵌入", "Inset"),
    oneLiner: loc("绝对定位用 inset，不要 translate 猜", "Absolute position with inset, not a translate guess"),
    scenes: [
      loc("卡片上的浮层", "A chip on a card"),
      loc("图片遮罩", "A media overlay"),
      loc("角标", "A corner badge"),
    ],
    rules: [
      loc("position: absolute; inset: …", "position: absolute; inset: …"),
      loc("四边同一值，或只写需要的边", "One value on four sides, or only the sides you need"),
      loc("不要 top + translate 目测", "Do not guess with top + translate"),
    ],
    spec: loc(
      "绝对定位用 inset 对齐，例如 inset: 10px。不要用 translate 猜像素，换尺寸就会歪。",
      "Line up absolute layers with inset, e.g. inset: 10px. Do not guess pixels with translate; the layer slips when the size changes.",
    ),
    note: loc("inset 是边。translate 是猜。", "Inset is an edge. Translate is a guess."),
    tells: loc("浮层四边缝一样宽", "The overlay’s four seams match"),
    css: `.chip {
  position: absolute;
  inset: 10px;
}`,
    wrongCss: `top: 14px; left: 22px;
right: 8px; bottom: 28px;
transform: translate(6px, -4px);`,
    wrongHint: loc("translate 猜", "Translate guess"),
    rightHint: loc("inset 四边", "Inset on four sides"),
    wrongCaption: loc("四边缝不等，换尺寸就歪", "Uneven seams; it slips when size changes"),
    rightCaption: loc("inset: 10px，四边同一条缝", "inset: 10px — four matching seams"),
  },
  {
    id: "numeric",
    index: "08",
    name: "Numeric",
    zh: loc("数位", "Numeric"),
    oneLiner: loc("金额等宽右对齐，小数点垂直成线", "Right-align numbers in tabular-nums; line up the decimal point"),
    scenes: [
      loc("费用明细", "Fee breakdowns"),
      loc("报价与账单", "Quotes and invoices"),
      loc("财务报表与多行统计", "Statements and multi-line metrics"),
    ],
    rules: [
      loc("text-align: right 金额列右对齐", "text-align: right for numeric columns"),
      loc("font-variant-numeric: tabular-nums 使用等宽数字", "font-variant-numeric: tabular-nums for equal width digits"),
      loc("统一保留两位小数，补齐零位", "Pad decimals to fixed precision (e.g. .00)"),
    ],
    spec: loc(
      "金额列右对齐，统一保留小数位，并开启等宽数字（tabular-nums）。让个位、十位和小数点上下对齐，方便比对大小。",
      "Right-align numeric columns, pad decimal places uniformly, and use tabular-nums so units, tens, and decimal points line up vertically.",
    ),
    note: loc("比较大小靠数位对齐。比例字体 1 比 9 窄，会把小数点扯歪。", "Magnitude comparison relies on digit columns. Proportional 1 is narrower than 9 and drags the decimal line."),
    tells: loc("小数点垂直成线，大小一眼看清", "Decimals form a vertical line; values compare at a glance"),
    css: `text-align: right;
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum";`,
    wrongCss: `text-align: left;
/* 比例数字，未补齐小数位 */
font-variant-numeric: normal;`,
    wrongHint: loc("左对齐 · 比例数字", "Left align · proportional"),
    rightHint: loc("右对齐 · 等宽数位", "Right align · tabular digits"),
    wrongCaption: loc("左对齐与变宽数字让个位十位错位，无法纵向比大小", "Left-aligned proportional numbers stagger digit columns"),
    rightCaption: loc("右对齐 + 等宽数字，小数点对齐成一条坚挺的轴", "Right-aligned tabular-nums locks decimals into one vertical axis"),
  },
  {
    id: "between",
    index: "09",
    name: "Between",
    zh: loc("两端", "Between"),
    oneLiner: loc("列表两端贴边，右侧状态垂直成线", "Pin both ends in a row; status forms a vertical scanning line"),
    scenes: [
      loc("预约记录与订单列表", "Booking and order records"),
      loc("设置项与菜单行", "Settings items and menu rows"),
      loc("键值列表与任务清单", "Key-value lists and task rows"),
    ],
    rules: [
      loc("justify-content: space-between", "justify-content: space-between"),
      loc("名称贴左边线，状态贴右边线", "Name hugs left edge, status hugs right edge"),
      loc("多行共用左右边线，便于纵向扫读", "All rows share left and right edges for effortless vertical scanning"),
    ],
    spec: loc(
      "列表每一行用两端对齐（justify-content: space-between）：名称贴左边线，状态贴右边线。状态在垂直方向对齐成列，方便快速扫读。",
      "Use justify-content: space-between on list rows: name hugs left, status hugs right. Status badges form a clean vertical column for fast scanning.",
    ),
    note: loc("状态紧跟名称会随字数左右漂移，右侧参差不齐逼人逐行找。", "Badges clinging to titles drift horizontally with title length, forcing ragged eye movement."),
    tells: loc("名称靠左、状态靠右，右边缘整齐成列", "Title on left, status on right; right edge scans straight down"),
    css: `display: flex;
align-items: center;
justify-content: space-between;
gap: 1rem;`,
    wrongCss: `display: flex;
align-items: center;
justify-content: flex-start;
gap: 0.75rem;`,
    wrongHint: loc("紧跟标题 · 状态漂移", "Follows title · status drifts"),
    rightHint: loc("两端贴边 · 扫读成列", "Space-between · scan column"),
    wrongCaption: loc("状态跟随标题字数左右漂移，右侧参差不齐", "Status position fluctuates with title length, jagged on the right"),
    rightCaption: loc("名称贴左、状态贴右，纵向形成一条笔直的扫读边缘", "Name hugs left, status hugs right; creates a straight scanning edge"),
  },
  {
    id: "reading",
    index: "10",
    name: "Reading",
    zh: loc("读线", "Reading"),
    oneLiner: loc("容器居中不代表文字居中，保持左侧起跑线", "Centering the box does not mean centering copy; keep the left start line"),
    scenes: [
      loc("居中卡片正文", "Centered card body copy"),
      loc("课程介绍与产品说明", "Course introductions and product descriptions"),
      loc("多行说明文与文章段落", "Multi-line paragraphs and articles"),
    ],
    rules: [
      loc("容器水平居中 margin-inline: auto", "Center container with margin-inline: auto"),
      loc("多行文本保持 text-align: left", "Keep multi-line copy at text-align: left"),
      loc("共用左侧起跑线，视线换行不费劲", "Share one left origin line so eyes return effortlessly"),
    ],
    spec: loc(
      "内容区在页面中水平居中（margin-inline: auto），但标题与正文必须保持左对齐（text-align: left），共用左侧起跑线。不要整块文字居中让行首跳动。",
      "Center the content container horizontally (margin-inline: auto), but keep headlines and body copy left-aligned (text-align: left) sharing a common left starting line.",
    ),
    note: loc("连续阅读时眼睛换行需要锚点。起点跳动会产生显著阅读疲劳。", "Eyes need a consistent left anchor when wrapping lines. A moving start line causes fatigue."),
    tells: loc("容器在正中，文字从同一个起点出发", "Container in the center; lines start from the exact same mark"),
    css: `.card {
  margin-inline: auto;
  max-width: 28rem;
  text-align: left;
}`,
    wrongCss: `.card {
  margin-inline: auto;
  max-width: 28rem;
  text-align: center; /* 容器居中顺手居中文本 */
}`,
    wrongHint: loc("文本居中 · 起点跳动", "Centered copy · jumping starts"),
    rightHint: loc("容器居中 · 文本左齐", "Centered box · left start line"),
    wrongCaption: loc("每行起点随行宽忽左忽右，换行视线需要重新搜寻", "Line starts bounce with line length, forcing eyes to hunt each return"),
    rightCaption: loc("容器居中保持版面均衡，正文共用左边线保证阅读流畅", "Balanced container position with a shared left origin for smooth reading"),
  },
  {
    id: "center",
    index: "11",
    name: "Center",
    zh: loc("中轴", "Center"),
    oneLiner: loc("结果区沿中轴聚焦，详细信息回归左对齐", "Hero result lines up on the center axis; details drop back to left alignment"),
    scenes: [
      loc("预约成功与支付完成", "Success and confirmation dialogs"),
      loc("空状态与短引导", "Empty states and quick onboarding"),
      loc("操作反馈卡片", "Action feedback cards"),
    ],
    rules: [
      loc("图标、短标题、主按钮沿垂直中轴居中", "Center icon, short headline, and primary CTA on the vertical midline"),
      loc("下方键值对详细信息保持左对齐", "Keep key-value details below left-aligned"),
      loc("不让详细信息跟结果区抢中轴", "Do not let secondary details fight the hero axis"),
    ],
    spec: loc(
      "反馈卡片的图标、短标题与主按钮沿中轴居中排列突出结果。下方的明细信息使用左对齐键值对，不要无差别全部居中抢夺焦点。",
      "Center the feedback icon, short title, and primary CTA along the vertical axis to highlight the result. Keep detailed rows below left-aligned so they don't compete.",
    ),
    note: loc("单一强行动沿中轴最有力。结构化明细一旦居中，键与值就飘散了。", "A single primary callout is strongest centered. Centering structured metadata scatters keys and values."),
    tells: loc("结果一锤定音，明细整齐清楚", "The result strikes the center; details read orderly below"),
    css: `.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.details {
  text-align: left;
}`,
    wrongCss: `.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center; /* 连同详细信息全部居中 */
}`,
    wrongHint: loc("全卡居中 · 争抢中轴", "All centered · competing axis"),
    rightHint: loc("结果中轴 · 明细左齐", "Hero center · details left"),
    wrongCaption: loc("明细键值对居中后四散飘动，与核心结果区争夺视线", "Centered details scatter key-value alignment and dilute the hero result"),
    rightCaption: loc("核心结果沿中轴放大聚焦，辅助明细靠左结构清晰", "Core result focused on center axis; secondary details structured cleanly"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("对齐什么", "What it aligns"),
    example: loc("基线、焦点、盒子、数位，还是缝 / 边", "Baseline, focus, box, digit — or a gap / an edge"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("价格单位、封面裁切、账单数字、列表状态", "Price units, cover crops, fee digits, list statuses"),
  },
  {
    n: "3",
    title: loc("规则", "Rule"),
    example: loc("baseline、cover + 焦点、tabular-nums、space-between", "baseline, cover + focus, tabular-nums, space-between"),
  },
];

export function kindMeta(id: KindId): KindMeta {
  return KINDS.find((kind) => kind.id === id) ?? KINDS[0]!;
}
