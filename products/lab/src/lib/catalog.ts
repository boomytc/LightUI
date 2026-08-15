import type { ComponentType } from "react";
import type { StudyMeta } from "./study";

export type LoadedStudy = {
  meta: StudyMeta;
  idea: string;
  StudyView?: ComponentType;
};

const metaModules = import.meta.glob("../../../../studies/*/study.json", {
  eager: true,
  import: "default",
}) as Record<string, StudyMeta>;

const ideaModules = import.meta.glob("../../../../studies/*/idea.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const viewModules = import.meta.glob("../../../../studies/*/src/StudyView.tsx", {
  eager: true,
}) as Record<string, { StudyView?: ComponentType }>;

function dirOf(jsonPath: string): string {
  return jsonPath.replace(/\/study\.json$/, "");
}

export function loadStudies(): LoadedStudy[] {
  const studies = Object.entries(metaModules).map(([jsonPath, meta]) => {
    const dir = dirOf(jsonPath);
    return {
      meta,
      idea: ideaModules[`${dir}/idea.md`] ?? "",
      StudyView: viewModules[`${dir}/src/StudyView.tsx`]?.StudyView,
    };
  });

  const rank: Record<StudyMeta["status"], number> = { active: 0, draft: 1, retired: 2 };
  return studies.sort((a, b) => {
    const byStatus = rank[a.meta.status] - rank[b.meta.status];
    if (byStatus !== 0) return byStatus;
    return a.meta.slug.localeCompare(b.meta.slug);
  });
}

export function loadStudy(slug: string): LoadedStudy | undefined {
  return loadStudies().find((s) => s.meta.slug === slug);
}
