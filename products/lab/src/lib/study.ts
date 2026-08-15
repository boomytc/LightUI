export type StudyStatus = "active" | "draft" | "retired";

export type StudyRel = "after" | "contrast";

export type StudyLink = {
  slug: string;
  rel: StudyRel;
  when?: string;
  whenEn?: string;
};

export type StudyMeta = {
  slug: string;
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
