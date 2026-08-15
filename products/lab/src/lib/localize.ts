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

export function studyAsks(meta: StudyMeta, locale: Locale): string | undefined {
  const value = localized(meta.asks ?? "", meta.asksEn, locale);
  return value || undefined;
}

export function linkWhen(when: string | undefined, whenEn: string | undefined, locale: Locale): string | undefined {
  const value = localized(when ?? "", whenEn, locale);
  return value || undefined;
}
