import { loc, type Localized } from "./site-locale";
import type { CascadeNode } from "./cascader";

export const ORDER_STATUSES = [
  { id: "pending", label: loc("待处理", "Pending") },
  { id: "doing", label: loc("进行中", "In progress") },
  { id: "done", label: loc("已完成", "Done") },
] as const;

export const SKILLS = [
  { id: "design", label: loc("设计", "Design") },
  { id: "writing", label: loc("写作", "Writing") },
  { id: "data", label: loc("数据", "Data") },
  { id: "product", label: loc("产品", "Product") },
  { id: "ops", label: loc("运营", "Ops") },
] as const;

export const SKILL_MAX = 5;

export type Person = { id: string; label: Localized };
export type Team = { id: string; label: Localized; items: readonly Person[] };

export const TEAMS: readonly Team[] = [
  {
    id: "design",
    label: loc("设计团队", "Design"),
    items: [
      { id: "linyi", label: loc("林一 · 视觉设计", "Lin Yi · Visual") },
      { id: "mia", label: loc("Mia · 品牌设计", "Mia · Brand") },
    ],
  },
  {
    id: "product",
    label: loc("产品团队", "Product"),
    items: [
      { id: "alex", label: loc("Alex · 产品经理", "Alex · PM") },
      { id: "xiaohe", label: loc("小禾 · 用户研究", "Xiaohe · Research") },
    ],
  },
  {
    id: "eng",
    label: loc("研发团队", "Engineering"),
    items: [
      { id: "leo", label: loc("Leo · 前端开发", "Leo · Frontend") },
      { id: "nana", label: loc("Nana · 后端工程", "Nana · Backend") },
    ],
  },
];

export type RegionNode = CascadeNode & {
  label: Localized;
  children?: RegionNode[];
};

export const REGIONS: RegionNode[] = [
  {
    id: "zj",
    label: loc("浙江省", "Zhejiang"),
    children: [
      {
        id: "hz",
        label: loc("杭州市", "Hangzhou"),
        children: [
          { id: "xh", label: loc("西湖区", "Xihu") },
          { id: "bj", label: loc("滨江区", "Binjiang") },
          { id: "gs", label: loc("拱墅区", "Gongshu") },
          { id: "sc", label: loc("上城区", "Shangcheng") },
          { id: "yh", label: loc("余杭区", "Yuhang") },
          { id: "xs", label: loc("萧山区", "Xiaoshan") },
        ],
      },
      {
        id: "nb",
        label: loc("宁波市", "Ningbo"),
        children: [
          { id: "hs", label: loc("海曙区", "Haishu") },
          { id: "yz", label: loc("鄞州区", "Yinzhou") },
          { id: "jb", label: loc("江北区", "Jiangbei") },
        ],
      },
      {
        id: "wz",
        label: loc("温州市", "Wenzhou"),
        children: [
          { id: "lc", label: loc("鹿城区", "Lucheng") },
          { id: "lw", label: loc("龙湾区", "Longwan") },
          { id: "oh", label: loc("瓯海区", "Ouhai") },
        ],
      },
      {
        id: "jx",
        label: loc("嘉兴市", "Jiaxing"),
        children: [
          { id: "nh", label: loc("南湖区", "Nanhu") },
          { id: "xz", label: loc("秀洲区", "Xiuzhou") },
        ],
      },
    ],
  },
  {
    id: "js",
    label: loc("江苏省", "Jiangsu"),
    children: [
      {
        id: "nj",
        label: loc("南京市", "Nanjing"),
        children: [
          { id: "xw", label: loc("玄武区", "Xuanwu") },
          { id: "qh", label: loc("秦淮区", "Qinhuai") },
          { id: "gl", label: loc("鼓楼区", "Gulou") },
        ],
      },
      {
        id: "sz",
        label: loc("苏州市", "Suzhou"),
        children: [
          { id: "gg", label: loc("姑苏区", "Gusu") },
          { id: "ip", label: loc("工业园区", "SIP") },
          { id: "wz2", label: loc("吴中区", "Wuzhong") },
        ],
      },
    ],
  },
  {
    id: "gd",
    label: loc("广东省", "Guangdong"),
    children: [
      {
        id: "gz",
        label: loc("广州市", "Guangzhou"),
        children: [
          { id: "th", label: loc("天河区", "Tianhe") },
          { id: "yx", label: loc("越秀区", "Yuexiu") },
          { id: "hz2", label: loc("海珠区", "Haizhu") },
        ],
      },
      {
        id: "sz2",
        label: loc("深圳市", "Shenzhen"),
        children: [
          { id: "ns", label: loc("南山区", "Nanshan") },
          { id: "ft", label: loc("福田区", "Futian") },
          { id: "ba", label: loc("宝安区", "Bao'an") },
        ],
      },
    ],
  },
  {
    id: "sc2",
    label: loc("四川省", "Sichuan"),
    children: [
      {
        id: "cd",
        label: loc("成都市", "Chengdu"),
        children: [
          { id: "wh", label: loc("武侯区", "Wuhou") },
          { id: "jj", label: loc("锦江区", "Jinjiang") },
          { id: "hi", label: loc("高新区", "Hi-tech") },
        ],
      },
    ],
  },
];

export function regionLabel(
  tree: readonly RegionNode[],
  path: readonly string[],
  locale: "zh" | "en",
): string[] {
  const labels: string[] = [];
  let level: readonly RegionNode[] = tree;
  for (const id of path) {
    const node: RegionNode | undefined = level.find((n) => n.id === id);
    if (!node) break;
    labels.push(node.label[locale]);
    level = node.children ?? [];
  }
  return labels;
}

export const MEGA_NAV = [
  { id: "product", label: loc("产品", "Product"), mega: true },
  { id: "solutions", label: loc("解决方案", "Solutions"), mega: false },
  { id: "resources", label: loc("资源", "Resources"), mega: false },
  { id: "pricing", label: loc("定价", "Pricing"), mega: false },
  { id: "docs", label: loc("文档", "Docs"), mega: false },
] as const;

export const MEGA_COLUMNS = [
  {
    id: "design",
    title: loc("设计工具", "Design"),
    items: [
      { id: "canvas", name: loc("画布", "Canvas"), desc: loc("无限画板", "Infinite board"), icon: "palette" },
      { id: "proto", name: loc("原型", "Prototype"), desc: loc("交互稿", "Flows"), icon: "layout" },
      { id: "kit", name: loc("素材库", "Library"), desc: loc("组件与图标", "Components"), icon: "box" },
      { id: "icons", name: loc("图标库", "Icons"), desc: loc("统一视觉", "One visual system"), icon: "pen" },
    ],
  },
  {
    id: "collab",
    title: loc("协作工具", "Collaborate"),
    items: [
      { id: "board", name: loc("白板", "Whiteboard"), desc: loc("实时共创", "Live together"), icon: "share" },
      { id: "docs", name: loc("文档", "Docs"), desc: loc("团队知识", "Team knowledge"), icon: "file" },
      { id: "comments", name: loc("评论", "Comments"), desc: loc("上下文讨论", "In context"), icon: "message" },
      { id: "tasks", name: loc("任务", "Tasks"), desc: loc("进度追踪", "Track work"), icon: "workflow" },
    ],
  },
  {
    id: "data",
    title: loc("数据工具", "Data"),
    items: [
      { id: "reports", name: loc("报表", "Reports"), desc: loc("业务看板", "Business view"), icon: "chart" },
      { id: "insights", name: loc("洞察", "Insights"), desc: loc("趋势分析", "Trends"), icon: "table" },
      { id: "dash", name: loc("数据看板", "Dashboards"), desc: loc("实时指标", "Live metrics"), icon: "chart" },
      { id: "export", name: loc("导出", "Export"), desc: loc("CSV / PDF", "CSV / PDF"), icon: "share" },
    ],
  },
  {
    id: "dev",
    title: loc("开发者", "Developers"),
    items: [
      { id: "api", name: loc("API", "API"), desc: loc("开放接口", "Open endpoints"), icon: "code" },
      { id: "guide", name: loc("开发文档", "Guides"), desc: loc("接入指南", "Get started"), icon: "book" },
      { id: "samples", name: loc("示例代码", "Samples"), desc: loc("快速起步", "Copy and run"), icon: "code" },
      { id: "status", name: loc("状态页", "Status"), desc: loc("服务健康", "Uptime"), icon: "workflow" },
    ],
  },
] as const;

export type MegaIcon = (typeof MEGA_COLUMNS)[number]["items"][number]["icon"];
