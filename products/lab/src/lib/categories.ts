import type { Locale } from "./prefs";
import type { StudyCategory, StudyMeta } from "./study";

export type CategoryId = "all" | StudyCategory;

const STUDY_CATEGORIES = new Set<StudyCategory>(["pointer", "layout", "controls", "feedback", "craft"]);

export function isStudyCategory(value: string | undefined): value is StudyCategory {
  return STUDY_CATEGORIES.has(value as StudyCategory);
}

/** Category lives on study.json. Missing or unknown values fall back to craft. */
export function getStudyCategory(meta: { category?: string } | undefined | null): StudyCategory {
  const category = meta?.category;
  return isStudyCategory(category) ? category : "craft";
}

export interface CategoryMeta {
  id: CategoryId;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
}

// Headings are repeated in scripts/sync-catalog.mjs for the README tables.
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
    if (categoryId !== "all" && getStudyCategory(meta) !== categoryId) {
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

    const cat = CATEGORIES.find((c) => c.id === getStudyCategory(meta));
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
