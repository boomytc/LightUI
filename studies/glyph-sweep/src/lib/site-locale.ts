import { useEffect, useState } from "react";

export type Locale = "zh" | "en";

export function readLocale(): Locale {
  if (typeof document === "undefined") return "zh";
  return document.documentElement.lang.startsWith("en") ? "en" : "zh";
}

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    const sync = () => setLocale(readLocale());
    window.addEventListener("lightui:prefs", sync);
    return () => window.removeEventListener("lightui:prefs", sync);
  }, []);

  return locale;
}

export type Localized = { zh: string; en: string };

export function loc(zh: string, en: string): Localized {
  return { zh, en };
}

export function pick(text: Localized, locale: Locale): string {
  return text[locale];
}
