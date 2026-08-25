import { loc, type Localized } from "./site-locale";

export const PAGE_SIZE = 6;
export const BATCH = 6;
export const INITIAL_VISIBLE = 6;

export type Resource = {
  id: string;
  mark: string;
  title: Localized;
  meta: Localized;
  tag: Localized;
};

const ROWS: Array<[string, string, string, string, string, string, string]> = [
  ["北", "北田速写", "North field notes", "草稿", "Draft", "12 页 · 昨天", "12 pages · yesterday"],
  ["港", "港湾字体试排", "Harbor type trial", "评审", "Review", "8 页 · 周二", "8 pages · Tue"],
  ["O", "周末速写本", "Weekend pack", "已发", "Sent", "3.2 MB · 周五", "3.2 MB · Fri"],
  ["封", "封面试排", "Cover trial", "样机", "Mock", "4 张 · 今天", "4 frames · today"],
  ["历", "录音室日历", "Studio calendar", "日程", "Calendar", "本周 6 场", "6 sessions this week"],
  ["色", "品牌色票", "Brand chips", "规范", "Spec", "48 色 · 周一", "48 chips · Mon"],
  ["报", "海报第二稿", "Poster v2", "评审", "Review", "A2 · 昨天", "A2 · yesterday"],
  ["线", "导航线框", "Nav wireframe", "草稿", "Draft", "3 屏 · 周二", "3 screens · Tue"],
  ["标", "图标 24 套", "Icon set 24", "交付", "Ship", "24 枚 · 周三", "24 glyphs · Wed"],
  ["剖", "产品剖面", "Product cut", "模型", "Model", "1.8 MB · 周四", "1.8 MB · Thu"],
  ["音", "客服录音", "Support take", "音频", "Audio", "31 MB · 上周", "31 MB · last week"],
  ["库", "库存快照", "Stock snapshot", "数据", "Data", "220 KB · 上周", "220 KB · last week"],
  ["清", "发布清单", "Ship list", "文档", "Doc", "12 KB · 周一", "12 KB · Mon"],
  ["首", "首页设计稿", "Home file", "设计", "Design", "18 MB · 今天", "18 MB · today"],
  ["季", "季度复盘", "Quarter review", "文档", "Doc", "9.1 MB · 周一", "9.1 MB · Mon"],
  ["馈", "用户反馈", "Feedback sheet", "数据", "Data", "640 KB · 昨天", "640 KB · yesterday"],
  ["需", "产品需求", "Product brief", "文档", "Doc", "2.4 MB · 今天", "2.4 MB · today"],
  ["物", "品牌物料", "Brand pack", "物料", "Kit", "84 MB · 3 月", "84 MB · Mar"],
  ["墙", "摄影墙", "Photo wall", "图片", "Photo", "36 张 · 上周", "36 stills · last week"],
  ["印", "字体试印", "Type proof", "印刷", "Print", "2 页 · 周五", "2 pages · Fri"],
  ["包", "包装展开", "Pack dieline", "印刷", "Print", "刀版 · 周二", "Dieline · Tue"],
  ["展", "展台平面", "Booth plan", "空间", "Space", "1:50 · 周三", "1:50 · Wed"],
  ["轴", "动效时间轴", "Motion timeline", "动效", "Motion", "12 s · 周四", "12 s · Thu"],
  ["照", "发布照片", "Launch stills", "图片", "Photo", "18 张 · 周五", "18 stills · Fri"],
];

export const RESOURCES: Resource[] = ROWS.map((row, i) => ({
  id: `r${String(i + 1).padStart(2, "0")}`,
  mark: row[0],
  title: loc(row[1], row[2]),
  tag: loc(row[3], row[4]),
  meta: loc(row[5], row[6]),
}));
