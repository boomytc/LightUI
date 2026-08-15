import type { ComponentType } from "react";
import { compareStudies } from "./dates";
import type { Locale } from "./prefs";
import type { StudyMeta } from "./study";

export type LoadedStudy = {
  meta: StudyMeta;
  ideas: { zh: string; en: string };
  StudyView?: ComponentType;
  StageView?: ComponentType;
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

const ideaEnModules = import.meta.glob("../../../../studies/*/idea.en.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const viewModules = import.meta.glob("../../../../studies/*/src/StudyView.tsx", {
  eager: true,
}) as Record<string, { StudyView?: ComponentType }>;

const stageModules = import.meta.glob("../../../../studies/*/src/StageView.tsx", {
  eager: true,
}) as Record<string, { StageView?: ComponentType }>;

function dirOf(jsonPath: string): string {
  return jsonPath.replace(/\/study\.json$/, "");
}

export function loadStudies(): LoadedStudy[] {
  const studies = Object.entries(metaModules).map(([jsonPath, meta]) => {
    const dir = dirOf(jsonPath);
    const zh = ideaModules[`${dir}/idea.md`] ?? "";
    return {
      meta,
      ideas: {
        zh,
        en: ideaEnModules[`${dir}/idea.en.md`] ?? zh,
      },
      StudyView: viewModules[`${dir}/src/StudyView.tsx`]?.StudyView,
      StageView: stageModules[`${dir}/src/StageView.tsx`]?.StageView,
    };
  });

  return studies.sort((a, b) => compareStudies(a.meta, b.meta));
}

export function loadStudy(slug: string): LoadedStudy | undefined {
  return loadStudies().find((s) => s.meta.slug === slug);
}

export function studyIdea(study: LoadedStudy, locale: Locale): string {
  return locale === "en" ? study.ideas.en : study.ideas.zh;
}
