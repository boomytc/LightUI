export type StudyStatus = "active" | "draft" | "retired";

/** Lab catalog domain. Required on study.json. Not a behavior tag. */
export type StudyCategory = "pointer" | "layout" | "controls" | "feedback" | "craft";

export type StudyRel = "after" | "contrast";

export type StudyLink = {
  slug: string;
  rel: StudyRel;
  when?: string;
  whenEn?: string;
};

export type StudyMeta = {
  slug: string;
  category: StudyCategory;
  title: string;
  titleEn?: string;
  eyebrow?: string;
  eyebrowEn?: string;
  summary: string;
  summaryEn?: string;
  /** The question this study answers. The node label in the judgment graph. */
  asks?: string;
  asksEn?: string;
  /** Outbound edges. `after` is the next question; `contrast` is a mix-up. */
  links?: StudyLink[];
  status: StudyStatus;
  tags: string[];
  created?: string;
  updated?: string;
};
