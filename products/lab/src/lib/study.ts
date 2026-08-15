export type StudyStatus = "active" | "draft" | "retired";

export type StudyOrigin = {
  kind: "extract" | "original";
  label: string;
  labelEn?: string;
  path?: string;
  lineage?: string[];
};

export type StudyMeta = {
  slug: string;
  title: string;
  titleEn?: string;
  eyebrow?: string;
  eyebrowEn?: string;
  summary: string;
  summaryEn?: string;
  status: StudyStatus;
  tags: string[];
  origin: StudyOrigin;
};
