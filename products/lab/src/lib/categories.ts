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
    nameZh: "指针与手势",
    nameEn: "Pointer & Gesture",
    descZh: "安全三角、长按选择、下拉刷新、拖放与视线量化",
    descEn: "Safe triangle, long-press selection, pull-to-refresh, drag commit, and gaze grid",
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
    descZh: "按钮重量、输入选择、填写职责、下拉与页签",
    descEn: "Button weights, input choices, filling duties, dropdowns, and tabs",
  },
  {
    id: "feedback",
    nameZh: "反馈与动效",
    nameEn: "Feedback & Motion",
    descZh: "进度、计时、提示打断、骨架等待与乐观回滚",
    descEn: "Progress, timers, notification levels, pending states, and optimistic rollback",
  },
  {
    id: "craft",
    nameZh: "视觉与对齐",
    nameEn: "Craft & Geometry",
    descZh: "基线对齐、边框光束、扫光、内凹角与可解释性",
    descEn: "Baseline alignment, border beam, glyph sweep, inverted notch, and explainability",
  },
];

const SLUG_CATEGORY_MAP: Record<string, CategoryId> = {
  "intent-cascade": "pointer",
  "look-quantize": "pointer",
  "scroll-chrome": "pointer",
  "drag-commit": "pointer",
  "guide-interrupt": "pointer",
  "chart-read": "pointer",
  "press-select": "pointer",
  "pull-refresh": "pointer",
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
  "fill-taxonomy": "controls",
  "tab-taxonomy": "controls",

  "progress-taxonomy": "feedback",
  "timer-taxonomy": "feedback",
  "notify-taxonomy": "feedback",
  "pending-taxonomy": "feedback",
  "overlay-taxonomy": "feedback",
  "carousel-taxonomy": "feedback",
  "recall-grade": "feedback",
  "optimistic-rollback": "feedback",

  "align-craft": "craft",
  "border-beam": "craft",
  "glyph-sweep": "craft",
  "inverted-notch": "craft",
  "chart-taxonomy": "craft",
  "bm25-explain": "craft",
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
