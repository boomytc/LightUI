import type { Locale } from "./prefs";
import type { StudyMeta } from "./study";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function parseDay(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return DAY.test(value) ? value : undefined;
}

/** Missing days sort last. */
export function compareDayDesc(a?: string, b?: string): number {
  const left = parseDay(a);
  const right = parseDay(b);
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return right.localeCompare(left);
}

export function studyUpdated(meta: Pick<StudyMeta, "created" | "updated">): string | undefined {
  return parseDay(meta.updated) ?? parseDay(meta.created);
}

export function compareStudies(a: StudyMeta, b: StudyMeta): number {
  const rank: Record<StudyMeta["status"], number> = { active: 0, draft: 1, retired: 2 };
  const byStatus = rank[a.status] - rank[b.status];
  if (byStatus !== 0) return byStatus;
  const byUpdated = compareDayDesc(studyUpdated(a), studyUpdated(b));
  if (byUpdated !== 0) return byUpdated;
  const byCreated = compareDayDesc(a.created, b.created);
  if (byCreated !== 0) return byCreated;
  return a.slug.localeCompare(b.slug);
}

export function stampLabel(
  created: string | undefined,
  updated: string | undefined,
  locale: Locale,
): string | undefined {
  const born = parseDay(created);
  const touched = parseDay(updated) ?? born;
  if (!touched) return undefined;
  if (born && born !== touched) {
    return locale === "en" ? `${born} · updated ${touched}` : `${born} · 更新 ${touched}`;
  }
  return touched;
}
