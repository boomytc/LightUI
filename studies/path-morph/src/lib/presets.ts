import type { IconInput, IconNode } from "./core/types";

export interface PresetPair {
  id: string;
  name: string;
  nameEn: string;
  summary: string;
  summaryEn: string;
  fromName: string;
  toName: string;
  from: IconInput;
  to: IconInput;
  expectedThetaDeg?: number;
  highlightAspect: "rotation" | "division" | "anchors" | "topology" | "inversion";
}

const MENU_ICON: IconInput = "M4 6h16M4 12h16M4 18h16";
const X_ICON: IconInput = "M18 6 6 18M6 6l12 12";

const ARROW_RIGHT_ICON: IconInput = "M5 12h14M12 5l7 7-7 7";
const ARROW_DOWN_ICON: IconInput = "M12 5v14M19 12l-7 7-7-7";

const PLUS_ICON: IconInput = "M5 12h14M12 5v14";

const CHECK_ICON: IconInput = "M20 6 9 17l-5-5";

const PLAY_ICON: IconNode = [
  ["polygon", { points: "6 3 20 12 6 21 6 3" }],
];

const PAUSE_ICON: IconNode = [
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" }],
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }],
];

const SQUARE_ICON: IconNode = [
  ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }],
];

const DIAMOND_ICON: IconInput = "M12 2 22 12 12 22 2 12Z";

const SUN_ICON: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "4" }],
  ["path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" }],
];

const MOON_ICON: IconInput = "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z";

const ZAP_ICON: IconInput = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";
const BOLT_ICON: IconInput = "M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11";

export const PRESET_PAIRS: PresetPair[] = [
  {
    id: "menu-x",
    name: "汉堡菜单 ↔ 关闭",
    nameEn: "Menu ↔ Close",
    summary: "三横线折叠为交叉叉号，λ 偏置选取最短 ±45° 旋转而非 135°。",
    summaryEn: "Three horizontal bars fold into an X; λ tie-break picks ±45° over 135°.",
    fromName: "Menu",
    toName: "X",
    from: MENU_ICON,
    to: X_ICON,
    expectedThetaDeg: -45,
    highlightAspect: "inversion",
  },
  {
    id: "arrow-turn",
    name: "右箭头 ↔ 下箭头",
    nameEn: "Arrow Right ↔ Down",
    summary: "刚体旋转 90°：Procrustes 闭式解自然涌现 θ=90°，全局混合保持刚体形态。",
    summaryEn: "Rigid 90° turn: Procrustes yields θ=90° in closed form with rigid block transport.",
    fromName: "ArrowRight",
    toName: "ArrowDown",
    from: ARROW_RIGHT_ICON,
    to: ARROW_DOWN_ICON,
    expectedThetaDeg: 90,
    highlightAspect: "rotation",
  },
  {
    id: "play-pause",
    name: "播放 ↔ 暂停",
    nameEn: "Play ↔ Pause",
    summary: "1 条多边形子路径 ↔ 2 个独立圆角柱：满射同位分裂（细胞分裂），不凭空坍缩。",
    summaryEn: "1 polygon subpath ↔ 2 rectangles: surjective cell division instead of vanishing.",
    fromName: "Play",
    toName: "Pause",
    from: PLAY_ICON,
    to: PAUSE_ICON,
    highlightAspect: "division",
  },
  {
    id: "plus-x",
    name: "加号 ↔ 叉号",
    nameEn: "Plus ↔ Cross",
    summary: "正交十字与对角十字：最小角旋转 45°，线性插值会在中间帧变成缩小的菱形。",
    summaryEn: "Orthogonal cross to diagonal: 45° rotation; linear lerp shrinks into a diamond.",
    fromName: "Plus",
    toName: "X",
    from: PLUS_ICON,
    to: X_ICON,
    expectedThetaDeg: 45,
    highlightAspect: "rotation",
  },
  {
    id: "square-diamond",
    name: "正方形 ↔ 菱形",
    nameEn: "Square ↔ Diamond",
    summary: "闭合曲线循环对齐：4 个角点等弧长锚定，极坐标旋转 45° 保持边长刚性。",
    summaryEn: "Closed loop circular correspondence: 4 anchored corners rotate 45° rigidly.",
    fromName: "Square",
    toName: "Diamond",
    from: SQUARE_ICON,
    to: DIAMOND_ICON,
    expectedThetaDeg: 45,
    highlightAspect: "anchors",
  },
  {
    id: "check-x",
    name: "对勾 ↔ 叉号",
    nameEn: "Check ↔ X",
    summary: "单折线到双交叉线：角点在途中平滑展开与锐化，保证端点完全保真。",
    summaryEn: "Bent checkmark to cross: corners sharpen/unfold with zero endpoint distortion.",
    fromName: "Check",
    toName: "X",
    from: CHECK_ICON,
    to: X_ICON,
    highlightAspect: "anchors",
  },
  {
    id: "sun-moon",
    name: "太阳 ↔ 月亮",
    nameEn: "Sun ↔ Moon",
    summary: "多光芒收敛与圆弧转月牙：多子路径平滑对齐与拓扑连续演变。",
    summaryEn: "Radial rays to crescent: multi-subpath alignment and continuous topology.",
    fromName: "Sun",
    toName: "Moon",
    from: SUN_ICON,
    to: MOON_ICON,
    highlightAspect: "topology",
  },
  {
    id: "zap-bolt",
    name: "闪电折线 ↔ 粗闪电",
    nameEn: "Zap ↔ Bolt",
    summary: "复杂折线与角点流转：等弧长积分自适应分配采样密度。",
    summaryEn: "Complex polyline transitions: Gauss-Legendre arc-length quadrature.",
    fromName: "Zap",
    toName: "Bolt",
    from: ZAP_ICON,
    to: BOLT_ICON,
    highlightAspect: "anchors",
  },
];
