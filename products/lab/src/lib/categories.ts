import type { Locale } from "./prefs";
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
    descZh: "连续输入离散化、触控意图消歧、阻尼与基准吸附",
    descEn: "Continuous-to-discrete quantization, touch disambiguation, damping, and snap",
  },
  {
    id: "layout",
    nameZh: "结构与导览",
    nameEn: "Layout & Navigation",
    descZh: "页面空间骨架、分栏拓扑、流内撑开、长文大纲与空间定位",
    descEn: "Page skeleton, split panes, inflow expansion, and spatial outline navigation",
  },
  {
    id: "controls",
    nameZh: "表单与控件",
    nameEn: "Controls & Forms",
    descZh: "动作操作重量、选与填的输入负荷、分阶段信息披露与提交模型",
    descEn: "Action weights, input load, progressive disclosure, and submit models",
  },
  {
    id: "feedback",
    nameZh: "反馈与打断",
    nameEn: "Feedback & Interruption",
    descZh: "状态占位、进度真伪、计时专注、破坏性确认防线、新手引导",
    descEn: "Pending placeholders, true progress, focus timers, confirmation guardrails, and guided tours",
  },
  {
    id: "craft",
    nameZh: "工程与几何",
    nameEn: "Craft & Geometry",
    descZh: "像素级数位基线、边框光束动效、圆角真实剪裁、矢量插值与算法可视呈现",
    descEn: "Pixel baselines, border beams, true notch masks, vector interpolation, and explainability",
  },
];

export const SLUG_CATEGORY_MAP: Record<string, CategoryId> = {
  // 指针与手势 (Pointer & Gesture - 14)
  "intent-cascade": "pointer",
  "look-quantize": "pointer",
  "scroll-chrome": "pointer",
  "drag-commit": "pointer",
  "chart-read": "pointer",
  "press-select": "pointer",
  "pull-refresh": "pointer",
  "sheet-snap": "pointer",
  "swipe-action": "pointer",
  "touch-context": "pointer",
  "wheel-picker": "pointer",
  "slide-confirm": "pointer",
  "cursor-spring": "pointer",
  "cone-reveal": "pointer",

  // 结构与导览 (Layout & Navigation - 11)
  "layout-taxonomy": "layout",
  "sidebar-taxonomy": "layout",
  "assistant-chrome": "layout",
  "dashboard-layers": "layout",
  "hero-taxonomy": "layout",
  "login-taxonomy": "layout",
  "nav-taxonomy": "layout",
  "expand-inflow": "layout",
  "page-append": "layout",
  "group-taxonomy": "layout",
  "locator-taxonomy": "layout",

  // 表单与控件 (Controls & Forms - 6)
  "button-taxonomy": "controls",
  "control-taxonomy": "controls",
  "dropdown-taxonomy": "controls",
  "tab-taxonomy": "controls",
  "fill-taxonomy": "controls",
  "validation-taxonomy": "controls",

  // 反馈与打断 (Feedback & Interruption - 10)
  "progress-taxonomy": "feedback",
  "timer-taxonomy": "feedback",
  "pending-taxonomy": "feedback",
  "optimistic-rollback": "feedback",
  "notify-taxonomy": "feedback",
  "overlay-taxonomy": "feedback",
  "confirm-taxonomy": "feedback",
  "guide-interrupt": "feedback",
  "carousel-taxonomy": "feedback",
  "recall-grade": "feedback",

  // 工程与几何 (Craft & Geometry - 8)
  "align-craft": "craft",
  "border-beam": "craft",
  "glyph-sweep": "craft",
  "inverted-notch": "craft",
  "container-morph": "craft",
  "path-morph": "craft",
  "chart-taxonomy": "craft",
  "bm25-explain": "craft",
};

export function getStudyCategory(slug: string): CategoryId {
  return SLUG_CATEGORY_MAP[slug] ?? "craft";
}

export function categoryLabel(id: string, locale: Locale): string {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return id;
  return locale === "en" ? cat.nameEn : cat.nameZh;
}

export function filterStudies<T extends { meta: StudyMeta }>(
  studies: T[],
  query: string,
  categoryId: CategoryId,
  selectedTag?: string,
): T[] {
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
    const titleEn = (meta.titleEn ?? "").toLowerCase();
    const summary = (meta.summary ?? "").toLowerCase();
    const summaryEn = (meta.summaryEn ?? "").toLowerCase();
    const asks = (meta.asks ?? "").toLowerCase();
    const asksEn = (meta.asksEn ?? "").toLowerCase();
    const slug = meta.slug.toLowerCase();
    const eyebrow = (meta.eyebrow ?? "").toLowerCase();
    const eyebrowEn = (meta.eyebrowEn ?? "").toLowerCase();
    const tags = (meta.tags ?? []).join(" ").toLowerCase();

    const cat = CATEGORIES.find((c) => c.id === getStudyCategory(meta.slug));
    const catZh = cat?.nameZh.toLowerCase() ?? "";
    const catEn = cat?.nameEn.toLowerCase() ?? "";

    return (
      title.includes(q) ||
      titleEn.includes(q) ||
      summary.includes(q) ||
      summaryEn.includes(q) ||
      asks.includes(q) ||
      asksEn.includes(q) ||
      slug.includes(q) ||
      eyebrow.includes(q) ||
      eyebrowEn.includes(q) ||
      tags.includes(q) ||
      catZh.includes(q) ||
      catEn.includes(q)
    );
  });
}
