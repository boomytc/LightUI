import { loc, type Localized } from "./site-locale";
import type { SnapPoint } from "./machines";

export type SnapMeta = {
  id: SnapPoint;
  name: Localized;
  height: number;
  role: Localized;
  underlay: Localized;
  description: Localized;
};

export const SNAPS_META: SnapMeta[] = [
  {
    id: "peek",
    name: loc("摘要折叠", "Collapsed Peek"),
    height: 118,
    role: loc("露出地点标题、营业状态与快捷导航", "Title, open status, and quick navigation"),
    underlay: loc("底图 ~75% 可见", "Map ~75% visible"),
    description: loc("常驻底栏，完全不妨碍地图探索", "Persistent bar, does not block map scanning"),
  },
  {
    id: "half",
    name: loc("半屏预览", "Half Preview"),
    height: 260,
    role: loc("展开关键营业信息、特色标签与简短摘要", "Business hours, feature tags, and summary"),
    underlay: loc("底图 ~50% 可见", "Map ~50% visible"),
    description: loc("平衡底图方位与地点属性阅读", "Balances spatial reference with content"),
  },
  {
    id: "full",
    name: loc("全展开详情", "Full Details"),
    height: 460,
    role: loc("完整图文列表、用户评价与长内容滚动", "Full photo gallery, reviews, and scrollable list"),
    underlay: loc("底图聚焦虚化", "Map de-emphasized"),
    description: loc("深度阅读，内部可独立纵向滚动", "In-depth reading with independent inner scrolling"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("拖拽跟手", "Tracking"),
    example: loc("标称区间 1:1 跟手，越界施加 0.20 弹性阻尼", "1:1 within bounds; 0.20 elastic damping beyond"),
  },
  {
    n: "2",
    title: loc("动量裁决", "Projection"),
    example: loc("速度超 0.45px/ms 直接跃迁下一档，静止释放选最近", "Flick >0.45px/ms jumps a notch; calm release snaps to nearest"),
  },
  {
    n: "3",
    title: loc("手势仲裁", "Arbitration"),
    example: loc("未满全屏锁死内滚动；满屏触顶向下拉才交接回抽屉", "Lock inner scroll until full; only down-drag at top collapses"),
  },
];

export type SnapMode = "smart" | "static_nearest" | "hard_clamp";

export const MODE_META: {
  id: SnapMode;
  name: Localized;
  hint: Localized;
  recommended?: boolean;
}[] = [
  {
    id: "smart",
    name: loc("动量 + 弹性阻尼", "Velocity + damping"),
    hint: loc("速度感应跃迁下一档，越界 0.20 阻尼", "Flick jumps a notch; 0.20 overdrag damping"),
    recommended: true,
  },
  {
    id: "static_nearest",
    name: loc("纯静态距离吸附", "Static nearest"),
    hint: loc("无速度感应，向上轻甩常因未过半而缩回", "No velocity; a short flick often snaps back"),
  },
  {
    id: "hard_clamp",
    name: loc("生硬截断无阻尼", "Hard clamp"),
    hint: loc("拉过极值直接撞墙，没有弹性拉伸", "Hits the wall at the extrema; no elastic stretch"),
  },
];

export const REASON_LABELS: Record<string, Localized> = {
  init: loc("初始", "Initial"),
  static_nearest: loc("静态就近", "Static nearest"),
  velocity_up: loc("上甩跃迁", "Flick up"),
  velocity_down: loc("下甩跃迁", "Flick down"),
  nearest: loc("就近吸附", "Nearest"),
  manual_tap: loc("点按跳档", "Tapped"),
};

export const PHASE_LABELS = {
  tracking: loc("跟手中", "Tracking"),
  overdrag: loc("越界阻尼", "Overdrag"),
  settled: loc("已落档", "Settled"),
} as const;

export const PLACE_DATA = {
  name: "河畔咖啡馆 · Waterfront Cafe",
  status: "营业中 · 08:30–21:00",
  distance: "距您 350m · 步行约 5 分钟",
  address: "静安区河畔创意园区 3 号楼 102",
  tags: ["安静舒适", "景观露台", "电源插座", "免费 WiFi", "手冲单品"],
  reviews: [
    { user: "小林", time: "10 分钟前", comment: "窗外河景很棒，适合带电脑办公，燕麦拿铁很香。" },
    { user: "阿澈", time: "昨天", comment: "二楼有露台，下午光线绝佳，周末人稍微有点多。" },
    { user: "晨曦", time: "3 天前", comment: "店员态度很好，手冲耶加雪菲风味明亮。" },
  ],
};
