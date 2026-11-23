import type { ComponentType } from "react";
import { compareStudies } from "./dates";
import type { Locale } from "./prefs";
import type { StudyMeta } from "./study";

type StudyViewModule = { StudyView?: ComponentType };
type StageViewModule = { StageView?: ComponentType };

export type LoadedStudy = {
  meta: StudyMeta;
  hasStudyView: boolean;
  hasStageView: boolean;
  hasMachinesCode: boolean;
  getCachedStudyView: () => ComponentType | undefined;
  getCachedStageView: () => ComponentType | undefined;
  getCachedStageCode: () => string | undefined;
  getCachedMachinesCode: () => string | undefined;
  getCachedIdea: (locale: Locale) => string | undefined;
  loadStudyView: () => Promise<ComponentType | undefined>;
  loadStageView: () => Promise<ComponentType | undefined>;
  loadStageCode: () => Promise<string>;
  loadMachinesCode: () => Promise<string | undefined>;
  loadIdea: (locale: Locale) => Promise<string>;
};

const metaModules = import.meta.glob("../../../../studies/*/study.json", {
  eager: true,
  import: "default",
}) as Record<string, StudyMeta>;

const ideaLoaders = import.meta.glob("../../../../studies/*/idea.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const ideaEnLoaders = import.meta.glob("../../../../studies/*/idea.en.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const viewLoaders = import.meta.glob(
  "../../../../studies/*/src/StudyView.tsx",
) as Record<string, () => Promise<StudyViewModule>>;

const stageLoaders = import.meta.glob(
  "../../../../studies/*/src/StageView.tsx",
) as Record<string, () => Promise<StageViewModule>>;

const stageRawLoaders = import.meta.glob("../../../../studies/*/src/StageView.tsx", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const machinesRawLoaders = import.meta.glob("../../../../studies/*/src/lib/machines.ts", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

function dirOf(jsonPath: string): string {
  return jsonPath.replace(/\/study\.json$/, "");
}

function createCachedLoader<T>(loader: (() => Promise<T>) | undefined): {
  get: () => T | undefined;
  load: () => Promise<T | undefined>;
} {
  let resolved = false;
  let value: T | undefined;
  let inflight: Promise<T | undefined> | null = null;

  return {
    get: () => (resolved ? value : undefined),
    load: () => {
      if (resolved) return Promise.resolve(value);
      if (!loader) {
        resolved = true;
        value = undefined;
        return Promise.resolve(undefined);
      }
      if (!inflight) {
        inflight = loader()
          .then((result) => {
            value = result;
            resolved = true;
            inflight = null;
            return value;
          })
          .catch((error) => {
            inflight = null;
            throw error;
          });
      }
      return inflight;
    },
  };
}

function buildLoadedStudy(jsonPath: string, meta: StudyMeta): LoadedStudy {
  const dir = dirOf(jsonPath);
  const viewLoader = viewLoaders[`${dir}/src/StudyView.tsx`];
  const stageLoader = stageLoaders[`${dir}/src/StageView.tsx`];
  const stageRawLoader = stageRawLoaders[`${dir}/src/StageView.tsx`];
  const machinesRawLoader = machinesRawLoaders[`${dir}/src/lib/machines.ts`];
  const zhIdeaLoader = ideaLoaders[`${dir}/idea.md`];
  const enIdeaLoader = ideaEnLoaders[`${dir}/idea.en.md`];

  const studyViewCache = createCachedLoader(
    viewLoader ? () => viewLoader().then((mod) => mod.StudyView) : undefined,
  );
  const stageViewCache = createCachedLoader(
    stageLoader ? () => stageLoader().then((mod) => mod.StageView) : undefined,
  );
  const stageCodeCache = createCachedLoader(stageRawLoader);
  const machinesCodeCache = createCachedLoader(machinesRawLoader);
  const zhIdeaCache = createCachedLoader(zhIdeaLoader);
  const enIdeaCache = createCachedLoader(enIdeaLoader ?? zhIdeaLoader);

  return {
    meta,
    hasStudyView: Boolean(viewLoader),
    hasStageView: Boolean(stageLoader),
    hasMachinesCode: Boolean(machinesRawLoader),
    getCachedStudyView: studyViewCache.get,
    getCachedStageView: stageViewCache.get,
    getCachedStageCode: stageCodeCache.get,
    getCachedMachinesCode: machinesCodeCache.get,
    getCachedIdea: (locale) => (locale === "en" ? enIdeaCache.get() : zhIdeaCache.get()),
    loadStudyView: studyViewCache.load,
    loadStageView: stageViewCache.load,
    loadStageCode: async () => (await stageCodeCache.load()) ?? "",
    loadMachinesCode: machinesCodeCache.load,
    loadIdea: async (locale) =>
      (await (locale === "en" ? enIdeaCache.load() : zhIdeaCache.load())) ?? "",
  };
}

const cachedStudies: LoadedStudy[] = Object.entries(metaModules)
  .map(([jsonPath, meta]) => buildLoadedStudy(jsonPath, meta))
  .sort((a, b) => compareStudies(a.meta, b.meta));

const cachedStudyMap = new Map<string, LoadedStudy>(
  cachedStudies.map((study) => [study.meta.slug, study]),
);

export function loadStudies(): LoadedStudy[] {
  return cachedStudies;
}

export function loadStudy(slug: string): LoadedStudy | undefined {
  return cachedStudyMap.get(slug);
}
