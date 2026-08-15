export type StudyStatus = "active" | "draft" | "retired";

export type StudyOrigin = {
  kind: "extract" | "original";
  label: string;
  path?: string;
  lineage?: string[];
};

export type StudyMeta = {
  slug: string;
  title: string;
  eyebrow?: string;
  summary: string;
  status: StudyStatus;
  tags: string[];
  origin: StudyOrigin;
};
