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
