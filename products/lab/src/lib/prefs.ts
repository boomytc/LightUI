import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export type Locale = "zh" | "en";

export const THEME_KEY = "lightui-theme";
export const LOCALE_KEY = "lightui-locale";
export const PREFS_EVENT = "lightui:prefs";
export const GITHUB_URL = "https://github.com/boomytc/LightUI";

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
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

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
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
