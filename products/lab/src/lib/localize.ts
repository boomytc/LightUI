import type { Locale } from "./prefs";
import type { StudyMeta } from "./study";

export function localized(zh: string, en: string | undefined, locale: Locale): string {
  return locale === "en" && en ? en : zh;
}

export function studyTitle(meta: StudyMeta, locale: Locale): string {
  return localized(meta.title, meta.titleEn, locale);
}

export function studySummary(meta: StudyMeta, locale: Locale): string {
  return localized(meta.summary, meta.summaryEn, locale);
}

export function studyEyebrow(meta: StudyMeta, locale: Locale): string | undefined {
  const value = localized(meta.eyebrow ?? "", meta.eyebrowEn, locale);
  return value || undefined;
}

export function studyOrigin(meta: StudyMeta, locale: Locale): string {
  return localized(meta.origin.label, meta.origin.labelEn, locale);
}
