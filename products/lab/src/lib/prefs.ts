import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export type Locale = "zh" | "en";

export const THEME_KEY = "lightui-theme";
export const LOCALE_KEY = "lightui-locale";
export const PREFS_EVENT = "lightui:prefs";
export const GITHUB_URL = "https://github.com/boomytc/LightUI";

function storedTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return null;
}

export function readTheme(): Theme {
  const stored = storedTheme();
  if (stored) return stored;
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function readLocale(): Locale {
  try {
    if (localStorage.getItem(LOCALE_KEY) === "en") return "en";
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined" && document.documentElement.lang.startsWith("en")) {
    return "en";
  }
  return "zh";
}

function applyThemeDom(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function applyTheme(theme: Theme) {
  applyThemeDom(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function applyLocaleDom(locale: Locale) {
  document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
}

function applyLocale(locale: Locale) {
  applyLocaleDom(locale);
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}

function emitPrefs() {
  window.dispatchEvent(new Event(PREFS_EVENT));
}

type Prefs = {
  theme: Theme;
  locale: Locale;
  toggleTheme: () => void;
  toggleLocale: () => void;
};

const PrefsContext = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [locale, setLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSchemeChange = (e: MediaQueryListEvent) => {
      if (storedTheme() !== null) return;
      const next: Theme = e.matches ? "dark" : "light";
      applyThemeDom(next);
      setTheme(next);
      emitPrefs();
    };
    mq?.addEventListener("change", onSchemeChange);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY || e.key === null) {
        const nextTheme = readTheme();
        applyThemeDom(nextTheme);
        setTheme(nextTheme);
        emitPrefs();
      }
      if (e.key === LOCALE_KEY || e.key === null) {
        const nextLocale = readLocale();
        applyLocaleDom(nextLocale);
        setLocale(nextLocale);
        emitPrefs();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mq?.removeEventListener("change", onSchemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo<Prefs>(
    () => ({
      theme,
      locale,
      toggleTheme: () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
        emitPrefs();
      },
      toggleLocale: () => {
        const next: Locale = locale === "zh" ? "en" : "zh";
        applyLocale(next);
        setLocale(next);
        emitPrefs();
      },
    }),
    [theme, locale],
  );

  return createElement(PrefsContext.Provider, { value }, children);
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs requires PrefsProvider");
  return ctx;
}
