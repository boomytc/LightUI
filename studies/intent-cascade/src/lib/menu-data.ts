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
import { loc, pick, type Locale, type Localized } from "./site-locale";

export type MenuNode = {
  id: string;
  label: Localized;
  icon: LucideIcon;
  tone?: "slate" | "amber" | "blue" | "green" | "rose" | "violet" | "orange";
  searchPlaceholder?: Localized;
  children?: MenuNode[];
};

export const FILTER_TREE: MenuNode[] = [
  {
    id: "status",
    label: loc("状态", "Status"),
    icon: CircleDashed,
    searchPlaceholder: loc("搜索状态...", "Search status..."),
    children: [
      { id: "status-backlog", label: loc("待办池", "Backlog"), icon: Inbox, tone: "slate" },
      { id: "status-todo", label: loc("待处理", "Todo"), icon: Clock3, tone: "slate" },
      { id: "status-doing", label: loc("进行中", "In progress"), icon: Activity, tone: "orange" },
      { id: "status-done", label: loc("已完成", "Done"), icon: Sparkles, tone: "blue" },
      { id: "status-cancel", label: loc("已取消", "Canceled"), icon: Minus, tone: "slate" },
    ],
  },
  {
    id: "assignee",
    label: loc("负责人", "Assignee"),
    icon: UserRound,
    searchPlaceholder: loc("搜索负责人...", "Search assignee..."),
    children: [
      { id: "assignee-me", label: loc("我自己", "Me"), icon: UserRound, tone: "blue" },
      { id: "assignee-unassigned", label: loc("未分配", "Unassigned"), icon: CircleDashed, tone: "slate" },
      { id: "assignee-lin", label: loc("林可", "Lin Ke"), icon: UserRound, tone: "violet" },
      { id: "assignee-chen", label: loc("陈舟", "Chen Zhou"), icon: UserRound, tone: "green" },
      { id: "assignee-zhou", label: loc("周晚", "Zhou Wan"), icon: UserRound, tone: "orange" },
    ],
  },
  {
    id: "priority",
    label: loc("优先级", "Priority"),
    icon: BarChart3,
    searchPlaceholder: loc("搜索优先级...", "Search priority..."),
    children: [
      { id: "prio-urgent", label: loc("紧急", "Urgent"), icon: Zap, tone: "rose" },
      { id: "prio-high", label: loc("高", "High"), icon: BarChart3, tone: "orange" },
      { id: "prio-mid", label: loc("中", "Medium"), icon: BarChart3, tone: "amber" },
      { id: "prio-low", label: loc("低", "Low"), icon: BarChart3, tone: "blue" },
      { id: "prio-none", label: loc("无优先级", "No priority"), icon: Minus, tone: "slate" },
    ],
  },
  {
    id: "tags",
    label: loc("标签", "Tags"),
    icon: Tag,
    searchPlaceholder: loc("搜索标签...", "Search tags..."),
    children: [
      { id: "tag-bug", label: loc("缺陷", "Bug"), icon: Bug, tone: "rose" },
      { id: "tag-improve", label: loc("改进", "Improvement"), icon: Sparkles, tone: "green" },
      { id: "tag-task", label: loc("任务", "Task"), icon: SquareCheck, tone: "blue" },
      { id: "tag-urgent", label: loc("紧急", "Urgent"), icon: Flag, tone: "rose" },
      { id: "tag-low", label: loc("低优先级", "Low priority"), icon: Layers, tone: "green" },
      { id: "tag-fe", label: loc("前端", "Frontend"), icon: Code2, tone: "orange" },
      { id: "tag-be", label: loc("后端", "Backend"), icon: Code2, tone: "blue" },
      { id: "tag-db", label: loc("数据库", "Database"), icon: Database, tone: "violet" },
    ],
  },
  {
    id: "project",
    label: loc("项目属性", "Project"),
    icon: Box,
    searchPlaceholder: loc("搜索项目属性...", "Search project..."),
    children: [
      { id: "proj-status", label: loc("项目状态", "Project status"), icon: CircleDashed },
      { id: "proj-health", label: loc("项目健康度", "Project health"), icon: Activity, tone: "orange" },
      { id: "proj-prio", label: loc("项目优先级", "Project priority"), icon: BarChart3 },
      {
        id: "proj-tags",
        label: loc("项目标签", "Project tags"),
        icon: Tag,
        searchPlaceholder: loc("搜索项目标签...", "Search project tags..."),
        children: [
          { id: "ptag-bug", label: loc("缺陷", "Bug"), icon: Bug, tone: "rose" },
          { id: "ptag-improve", label: loc("改进", "Improvement"), icon: Sparkles, tone: "green" },
          { id: "ptag-task", label: loc("任务", "Task"), icon: SquareCheck, tone: "blue" },
          { id: "ptag-urgent", label: loc("紧急", "Urgent"), icon: Flag, tone: "rose" },
          { id: "ptag-low", label: loc("低优先级", "Low priority"), icon: Layers, tone: "green" },
          { id: "ptag-fe", label: loc("前端", "Frontend"), icon: Code2, tone: "orange" },
          { id: "ptag-be", label: loc("后端", "Backend"), icon: Code2, tone: "blue" },
          { id: "ptag-db", label: loc("数据库", "Database"), icon: Database, tone: "violet" },
        ],
      },
      { id: "proj-owner", label: loc("项目负责人", "Project lead"), icon: UserRound },
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

export function collectPathLabels(tree: MenuNode[], ids: string[], locale: Locale): string[] {
  const labels: string[] = [];
  let level = tree;
  for (const id of ids) {
    const node = level.find((n) => n.id === id);
    if (!node) break;
    labels.push(pick(node.label, locale));
    level = node.children ?? [];
  }
  return labels;
}

export const DEMO_HINTS = [
  {
    id: "diag",
    title: loc("斜向穿越", "Diagonal crossing"),
    body: loc(
      "把指针放在「状态」上，再斜着滑向右侧「已取消」。中间会掠过负责人 / 优先级，但子菜单不该跳走。",
      "Rest on Status, then slide diagonally to Canceled. You will pass Assignee / Priority; the submenu should stay.",
    ),
    icon: AlertTriangle,
  },
  {
    id: "vert",
    title: loc("纵向切换", "Vertical switch"),
    body: loc(
      "沿一级菜单上下移动时，应当立刻切换子菜单——意图预测只保护「朝向子菜单」的轨迹。",
      "Moving up and down the first column should switch immediately. Intent only protects a path toward the submenu.",
    ),
    icon: FolderKanban,
  },
  {
    id: "third",
    title: loc("三级穿透", "Third level"),
    body: loc(
      "打开 项目属性 → 项目标签，再斜向进入「紧急」。每一级都有自己的安全三角。",
      "Open Project → Project tags, then enter Urgent on a diagonal. Each level has its own safe triangle.",
    ),
    icon: Layers,
  },
];
