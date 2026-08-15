import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Box,
  Bug,
  CircleDashed,
  Clock3,
  Code2,
  Database,
  Flag,
  FolderKanban,
  Inbox,
  Layers,
  Minus,
  Sparkles,
  SquareCheck,
  Tag,
  UserRound,
  Zap,
} from "lucide-react";

export type MenuNode = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone?: "slate" | "amber" | "blue" | "green" | "rose" | "violet" | "orange";
  searchPlaceholder?: string;
  children?: MenuNode[];
};

export const FILTER_TREE: MenuNode[] = [
  {
    id: "status",
    label: "状态",
    icon: CircleDashed,
    searchPlaceholder: "搜索状态...",
    children: [
      { id: "status-backlog", label: "待办池", icon: Inbox, tone: "slate" },
      { id: "status-todo", label: "待处理", icon: Clock3, tone: "slate" },
      { id: "status-doing", label: "进行中", icon: Activity, tone: "orange" },
      { id: "status-done", label: "已完成", icon: Sparkles, tone: "blue" },
      { id: "status-cancel", label: "已取消", icon: Minus, tone: "slate" },
    ],
  },
  {
    id: "assignee",
    label: "负责人",
    icon: UserRound,
    searchPlaceholder: "搜索负责人...",
    children: [
      { id: "assignee-me", label: "我自己", icon: UserRound, tone: "blue" },
      { id: "assignee-unassigned", label: "未分配", icon: CircleDashed, tone: "slate" },
      { id: "assignee-lin", label: "林可", icon: UserRound, tone: "violet" },
      { id: "assignee-chen", label: "陈舟", icon: UserRound, tone: "green" },
      { id: "assignee-zhou", label: "周晚", icon: UserRound, tone: "orange" },
    ],
  },
  {
    id: "priority",
    label: "优先级",
    icon: BarChart3,
    searchPlaceholder: "搜索优先级...",
    children: [
      { id: "prio-urgent", label: "紧急", icon: Zap, tone: "rose" },
      { id: "prio-high", label: "高", icon: BarChart3, tone: "orange" },
      { id: "prio-mid", label: "中", icon: BarChart3, tone: "amber" },
      { id: "prio-low", label: "低", icon: BarChart3, tone: "blue" },
      { id: "prio-none", label: "无优先级", icon: Minus, tone: "slate" },
    ],
  },
  {
    id: "tags",
    label: "标签",
    icon: Tag,
    searchPlaceholder: "搜索标签...",
    children: [
      { id: "tag-bug", label: "缺陷", icon: Bug, tone: "rose" },
      { id: "tag-improve", label: "改进", icon: Sparkles, tone: "green" },
      { id: "tag-task", label: "任务", icon: SquareCheck, tone: "blue" },
      { id: "tag-urgent", label: "紧急", icon: Flag, tone: "rose" },
      { id: "tag-low", label: "低优先级", icon: Layers, tone: "green" },
      { id: "tag-fe", label: "前端", icon: Code2, tone: "orange" },
      { id: "tag-be", label: "后端", icon: Code2, tone: "blue" },
      { id: "tag-db", label: "数据库", icon: Database, tone: "violet" },
    ],
  },
  {
    id: "project",
    label: "项目属性",
    icon: Box,
    searchPlaceholder: "搜索项目属性...",
    children: [
      { id: "proj-status", label: "项目状态", icon: CircleDashed },
      { id: "proj-health", label: "项目健康度", icon: Activity, tone: "orange" },
      { id: "proj-prio", label: "项目优先级", icon: BarChart3 },
      {
        id: "proj-tags",
        label: "项目标签",
        icon: Tag,
        searchPlaceholder: "搜索项目标签...",
        children: [
          { id: "ptag-bug", label: "缺陷", icon: Bug, tone: "rose" },
          { id: "ptag-improve", label: "改进", icon: Sparkles, tone: "green" },
          { id: "ptag-task", label: "任务", icon: SquareCheck, tone: "blue" },
          { id: "ptag-urgent", label: "紧急", icon: Flag, tone: "rose" },
          { id: "ptag-low", label: "低优先级", icon: Layers, tone: "green" },
          { id: "ptag-fe", label: "前端", icon: Code2, tone: "orange" },
          { id: "ptag-be", label: "后端", icon: Code2, tone: "blue" },
          { id: "ptag-db", label: "数据库", icon: Database, tone: "violet" },
        ],
      },
      { id: "proj-owner", label: "项目负责人", icon: UserRound },
    ],
  },
];

export const TONE_CLASS: Record<NonNullable<MenuNode["tone"]>, string> = {
  slate: "text-fg-subtle",
  amber: "text-amber-500",
  blue: "text-accent",
  green: "text-intent",
  rose: "text-rose-500",
  violet: "text-violet-500",
  orange: "text-orange-500",
};

export function findNode(nodes: MenuNode[], id: string): MenuNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNode(n.children, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function collectPathLabels(tree: MenuNode[], ids: string[]): string[] {
  const labels: string[] = [];
  let level = tree;
  for (const id of ids) {
    const node = level.find((n) => n.id === id);
    if (!node) break;
    labels.push(node.label);
    level = node.children ?? [];
  }
  return labels;
}

export const DEMO_HINTS = [
  {
    title: "斜向穿越",
    body: "把指针放在「状态」上，再斜着滑向右侧「已取消」。中间会掠过负责人 / 优先级，但子菜单不该跳走。",
    icon: AlertTriangle,
  },
  {
    title: "纵向切换",
    body: "沿一级菜单上下移动时，应当立刻切换子菜单——意图预测只保护「朝向子菜单」的轨迹。",
    icon: FolderKanban,
  },
  {
    title: "三级穿透",
    body: "打开 项目属性 → 项目标签，再斜向进入「紧急」。每一级都有自己的安全三角。",
    icon: Layers,
  },
];
