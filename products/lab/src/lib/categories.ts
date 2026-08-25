import type { StudyMeta } from "./study";

export type CategoryId = "all" | "pointer" | "layout" | "controls" | "feedback" | "craft";

export interface CategoryMeta {
  id: CategoryId;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "all",
    nameZh: "全部",
    nameEn: "All",
    descZh: "全部交互设计研究",
    descEn: "All UI/UX design studies",
  },
  {
    id: "pointer",
    nameZh: "指针与几何",
    nameEn: "Pointer & Geometry",
    descZh: "安全三角、视线量化与轨迹保护",
    descEn: "Safe triangle, gaze grid, and track protection",
  },
  {
    id: "layout",
    nameZh: "结构与布局",
    nameEn: "Layout & Structure",
    descZh: "页面骨架、分栏、助手与看板层递",
    descEn: "Page skeleton, sidebar, assistant chrome, and layers",
  },
  {
    id: "controls",
    nameZh: "表单与控件",
    nameEn: "Controls & Forms",
    descZh: "按钮重量、输入选择、下拉与页签",
    descEn: "Button weights, input choices, dropdowns, and tabs",
  },
  {
    id: "feedback",
    nameZh: "反馈与动效",
    nameEn: "Feedback & Motion",
    descZh: "进度、计时、提示打断与骨架等待",
    descEn: "Progress, timers, notification levels, and pending states",
  },
  {
    id: "craft",
    nameZh: "视觉与对齐",
    nameEn: "Craft & Geometry",
    descZh: "基线对齐、边框光束、扫光与内凹角",
    descEn: "Baseline alignment, border beam, glyph sweep, and inverted notch",
  },
];

const SLUG_CATEGORY_MAP: Record<string, CategoryId> = {
  "intent-cascade": "pointer",
  "look-quantize": "pointer",
  "scroll-chrome": "pointer",
  "drag-commit": "pointer",
  "guide-interrupt": "pointer",
  "chart-read": "pointer",
  "container-morph": "craft",

  "layout-taxonomy": "layout",
  "sidebar-taxonomy": "layout",
  "assistant-chrome": "layout",
  "dashboard-layers": "layout",
  "hero-taxonomy": "layout",
  "login-taxonomy": "layout",
  "nav-taxonomy": "layout",
  "expand-inflow": "layout",
  "page-append": "layout",

  "button-taxonomy": "controls",
  "control-taxonomy": "controls",
  "dropdown-taxonomy": "controls",
  "validation-taxonomy": "controls",
  "tab-taxonomy": "controls",

  "progress-taxonomy": "feedback",
  "timer-taxonomy": "feedback",
  "notify-taxonomy": "feedback",
  "pending-taxonomy": "feedback",
  "overlay-taxonomy": "feedback",
  "carousel-taxonomy": "feedback",
  "recall-grade": "feedback",

  "align-craft": "craft",
  "border-beam": "craft",
  "glyph-sweep": "craft",
  "inverted-notch": "craft",
  "chart-taxonomy": "craft",
};

export function getStudyCategory(slug: string): CategoryId {
  return SLUG_CATEGORY_MAP[slug] ?? "craft";
}

export function filterStudies(
  studies: { meta: StudyMeta }[],
  query: string,
  categoryId: CategoryId,
  selectedTag?: string,
): { meta: StudyMeta }[] {
  const q = query.trim().toLowerCase();

  return studies.filter(({ meta }) => {
    if (categoryId !== "all" && getStudyCategory(meta.slug) !== categoryId) {
      return false;
    }

    if (selectedTag && !meta.tags?.includes(selectedTag)) {
      return false;
    }

    if (!q) return true;

    const title = (meta.title ?? "").toLowerCase();
    const summary = (meta.summary ?? "").toLowerCase();
    const asks = (meta.asks ?? "").toLowerCase();
    const asksEn = (meta.asksEn ?? "").toLowerCase();
    const slug = meta.slug.toLowerCase();
    const eyebrow = (meta.eyebrow ?? "").toLowerCase();
    const tags = (meta.tags ?? []).join(" ").toLowerCase();

    return (
      title.includes(q) ||
      summary.includes(q) ||
      asks.includes(q) ||
      asksEn.includes(q) ||
      slug.includes(q) ||
      eyebrow.includes(q) ||
      tags.includes(q)
    );
  });
}
