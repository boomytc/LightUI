import { loc, type Localized } from "./site-locale";
import type { Followup, KindId, Mark } from "./machines";

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
  window: Localized;
  headline: Localized;
  sub: Localized;
  primary: { mark: Mark; label: Localized };
  alt: { mark: Mark; label: Localized };
  defaultFollowup: Followup;
};

export const KINDS: KindMeta[] = [
  {
    id: "change",
    index: "01",
    name: "Change",
    zh: loc("看变化", "Change"),
    oneLiner: loc("时间上怎么走，涨了还是跌了", "How it moves over time — up or down"),
    scenes: [
      loc("月销售额", "Monthly sales"),
      loc("用户增长", "User growth"),
      loc("日活访问", "Daily visits"),
    ],
    rules: [
      loc("横轴必须是等间距时间；缺测要断开", "The x-axis is equally spaced time; break a gap"),
      loc("无序类别不要用折线硬连", "Do not connect unordered categories with a line"),
      loc("只要走势用折线；还要体积用面积，轴从 0", "Trend only: line. Volume too: area. Axis from 0"),
    ],
    spec: loc(
      "这组数据要看随时间的变化。用折线，横轴等间距月份，不要把无序类别硬连。只要走势用折线；还要体积用面积，纵轴从 0 起。",
      "This data is for change over time. Use a line; the x-axis is equally spaced months. Do not connect unordered categories. Trend only: a line. Volume too: an area, axis from 0.",
    ),
    note: loc("时间趋势不要用饼。饼没有从左到右。", "Do not pie a time trend. A pie has no left-to-right."),
    tells: loc("线条跟着月份走，不是把类别串起来", "The line follows months, not a string of categories"),
    window: loc("月报 · 销售额", "Monthly · sales"),
    headline: loc("月销售额", "Monthly sales"),
    sub: loc("万元 · 横轴是连续月份", "¥10k · x-axis is continuous months"),
    primary: { mark: "line", label: loc("只要走势", "Trend only") },
    alt: { mark: "area", label: loc("还要体积", "Volume too") },
    defaultFollowup: "primary",
  },
  {
    id: "compare",
    index: "02",
    name: "Compare",
    zh: loc("比大小", "Compare"),
    oneLiner: loc("几个对象谁多谁少、谁排前面", "Which of these is bigger, and who ranks first"),
    scenes: [
      loc("各产品销量", "Units by product"),
      loc("城市订单榜", "City ranking"),
      loc("部门人数", "Headcount"),
    ],
    rules: [
      loc("短名用竖柱，长名或排名用横条", "Short names: columns. Long names or rank: bars"),
      loc("轴从 0 起，否则对比被夸大", "Axis from 0, or the comparison is a lie"),
      loc("柱宽一致；横条按数值降序，最大的在上", "Equal column width; bars descend, largest on top"),
    ],
    spec: loc(
      "这组数据要比几个类别谁多谁少。短名用竖柱，长名或排名用横条，轴从 0 起，不要把名字转 45°。",
      "This data is for comparing size. Short names: columns. Long names or a ranking: bars. Axis from 0. Do not rotate the labels 45°.",
    ),
    note: loc("长名字不要竖柱。名字会挤、会转角，改横条。", "Do not stand long names up as columns. They crowd and rotate. Use bars."),
    tells: loc("高低直接比，名字横着写全", "Height is the comparison; names stay horizontal"),
    window: loc("品类 · 销量", "Category · units"),
    headline: loc("品类销量", "Units by category"),
    sub: loc("件 · 轴从 0 起", "units · axis from 0"),
    primary: { mark: "column", label: loc("短名竖柱", "Short · columns") },
    alt: { mark: "bar", label: loc("长名横条", "Long · bars") },
    defaultFollowup: "primary",
  },
  {
    id: "share",
    index: "03",
    name: "Share",
    zh: loc("看占比", "Share"),
    oneLiner: loc("整体怎么切，内部怎么拆", "How the whole is cut, and how the inside splits"),
    scenes: [
      loc("预算分配", "Budget mix"),
      loc("市场占比", "Market share"),
      loc("季度 × 产品线", "Quarter × line"),
    ],
    rules: [
      loc("不超过 5 类用环形，从 12 点起", "Five slices or fewer: a donut, from 12 o'clock"),
      loc("内部再拆用堆叠，不要一排小饼", "An inner split is stacked, not a row of pies"),
      loc("不要用饼图比趋势", "A pie is not a trend"),
    ],
    spec: loc(
      "这组数据要看构成。不超过 5 类用环形，从 12 点起切；每个类别内部再拆用堆叠。不要用饼图比趋势。",
      "This data is for share. Five slices or fewer: a donut starting at 12 o'clock. An inner split: stacked. Do not pie a trend.",
    ),
    note: loc("饼不是趋势，也不是精确比大小。", "A pie is not a trend, and not a precise size comparison."),
    tells: loc("从 12 点切开，超过五类就改柱", "Cut from 12 o'clock; past five slices, use columns"),
    window: loc("预算 · 构成", "Budget · mix"),
    headline: loc("预算构成", "Budget mix"),
    sub: loc("五类 · 从 12 点起", "five slices · from 12 o'clock"),
    primary: { mark: "pie", label: loc("整体切块", "Cut the whole") },
    alt: { mark: "stacked", label: loc("内部再拆", "Split inside") },
    defaultFollowup: "primary",
  },
  {
    id: "relate",
    index: "04",
    name: "Relate",
    zh: loc("看关系", "Relate"),
    oneLiner: loc("两个东西是不是一起变", "Whether two things move together"),
    scenes: [
      loc("投放 vs 销量", "Spend vs sales"),
      loc("周 × 小时活跃", "Week × hour"),
      loc("价格 vs 转化", "Price vs conversion"),
    ],
    rules: [
      loc("两个连续数值用散点，不要折线硬连", "Two continuous numbers: scatter. Do not join the dots"),
      loc("两个维度交叉用热力，同一色相明度阶梯", "Two dimensions × intensity: a heatmap, one hue"),
      loc("点越成线越相关；颜色越深值越大", "A line of dots is correlation; darker is larger"),
    ],
    spec: loc(
      "这组数据要看两个量有没有一起变。两个连续数用散点，不要折线硬连；两个维度交叉用热力，同一色相。",
      "This data is for a relationship. Two continuous numbers: a scatter, do not join the dots. Two dimensions × intensity: a heatmap, one hue.",
    ),
    note: loc("占比、趋势、排名都不是散点的活。", "Share, trend, and rank are not a scatter's job."),
    tells: loc("点自己说话，或用深浅看交叉", "Let the dots speak, or read a cross with shade"),
    window: loc("投放 · 销量", "Spend · sales"),
    headline: loc("投放 vs 销量", "Spend vs sales"),
    sub: loc("两个连续数 · 不要硬连", "two continuous numbers · do not join"),
    primary: { mark: "scatter", label: loc("两个连续数", "Two numbers") },
    alt: { mark: "heatmap", label: loc("两个维度", "Two dimensions") },
    defaultFollowup: "primary",
  },
  {
    id: "flow",
    index: "05",
    name: "Flow",
    zh: loc("看流程", "Flow"),
    oneLiner: loc("一步步转化，哪步掉得最多", "Step by step conversion — where it drops"),
    scenes: [
      loc("曝光到付费", "Shown to pay"),
      loc("简历到入职", "Resume to hire"),
      loc("试用到续费", "Trial to renew"),
    ],
    rules: [
      loc("步骤必须有先后包含关系", "Each step must contain the next"),
      loc("从上到下写全链路，标人数和转化率", "Write the whole chain; mark count and rate"),
      loc("并列类别不要做成漏斗", "Sibling categories are not a funnel"),
    ],
    spec: loc(
      "这组数据要看有先后包含关系的转化。用漏斗：曝光 → 点击 → 付费，标每步人数和转化率。并列类别不要做成漏斗。",
      "This data is for an ordered conversion. Use a funnel: shown → click → pay, with count and rate on each step. Sibling categories are not a funnel.",
    ),
    note: loc("上一步是下一步的全集。并排比大小用柱。", "The previous step is the next step's whole set. Side-by-side size is columns."),
    tells: loc("哪一步掉得多，一眼看穿", "You can see which step drops the most"),
    window: loc("转化 · 漏斗", "Conversion · funnel"),
    headline: loc("曝光到付费", "Shown to pay"),
    sub: loc("上一步是下一步的全集", "each step contains the next"),
    primary: { mark: "funnel", label: loc("转化链路", "Conversion chain") },
    alt: { mark: "funnel", label: loc("转化链路", "Conversion chain") },
    defaultFollowup: "primary",
  },
  {
    id: "ability",
    index: "06",
    name: "Ability",
    zh: loc("看能力", "Ability"),
    oneLiner: loc("多项打分，全面还是偏科", "Several scores — rounded or lopsided"),
    scenes: [
      loc("产品评测", "A product review"),
      loc("能力模型", "A skill model"),
      loc("竞品对比", "A competitor set"),
    ],
    rules: [
      loc("5–7 维，全部 0–100，量纲必须可比较", "5–7 axes, all 0–100, comparable units"),
      loc("轴从 0 起、同尺度", "Axes from 0, same scale"),
      loc("偏科露出尖角，全面接近正多边形", "Lopsided makes a spike; rounded is a regular polygon"),
    ],
    spec: loc(
      "这组数据要给同一对象打多项分。用雷达，5–7 维全部 0–100、轴从 0，看全面还是偏科。量纲不可比就不要画。",
      "This data is several scores on one object. Use a radar: 5–7 axes, all 0–100, from 0. Rounded vs lopsided. Skip it if the units are not comparable.",
    ),
    note: loc("量纲不可比，图形骗人。不要堆三个以上对象。", "Incomparable units lie. Do not stack more than two objects."),
    tells: loc("尖角是偏科，正多边形是全面", "A spike is lopsided; a regular polygon is rounded"),
    window: loc("评测 · 能力", "Review · scores"),
    headline: loc("产品评测", "Product scores"),
    sub: loc("0–100 · 全面还是偏科", "0–100 · rounded or lopsided"),
    primary: { mark: "radar", label: loc("多项能力", "Several scores") },
    alt: { mark: "radar", label: loc("多项能力", "Several scores") },
    defaultFollowup: "primary",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个图表」，说折线或横条", "Not “a chart” — a line, or a bar"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("看变化、比大小、占比、关系、流程还是能力", "Change, size, share, relation, flow, or ability"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("时间才连线、轴从 0、饼不超过 5 片", "Time before a line, axis from 0, five pie slices max"),
  },
];
