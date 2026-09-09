import { useEffect, useState } from "react";

export type Locale = "zh" | "en";

export type Localized = {
  zh: string;
  en: string;
};

export function loc(zh: string, en: string): Localized {
  return { zh, en };
}

export function pick(l: Localized, locale: Locale): string {
  return locale === "en" ? l.en : l.zh;
}

export function readLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const doc = document.documentElement.lang;
  if (doc && doc.toLowerCase().startsWith("en")) return "en";
  const nav = navigator.language;
  if (nav && nav.toLowerCase().startsWith("en")) return "en";
  return "zh";
}

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    function update() {
      setLocale(readLocale());
    }
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    window.addEventListener("languagechange", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("languagechange", update);
    };
  }, []);

  return locale;
}
