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
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("对齐什么", "What it aligns"),
    example: loc("基线、焦点、盒子，还是缝 / 边", "Baseline, focus, box — or a gap / an edge"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("价格单位、封面裁切、图标行", "A price, a cover crop, an icon row"),
  },
  {
    n: "3",
    title: loc("规则", "Rule"),
    example: loc("baseline、cover + 焦点、交叉轴 center", "baseline, cover + focus, cross-axis center"),
  },
];

export function kindMeta(id: KindId): KindMeta {
  return KINDS.find((kind) => kind.id === id) ?? KINDS[0]!;
}
