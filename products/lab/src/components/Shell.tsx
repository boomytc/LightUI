import { useEffect, useState, type ReactNode } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { Link } from "./Link";
import { messages } from "../lib/i18n";
import { usePath } from "../lib/nav";
import { GITHUB_URL, usePrefs } from "../lib/prefs";

const NAV = [
  { href: "/studies", key: "navWorks" as const, match: (p: string) => p === "/studies" || p.startsWith("/s/") },
  { href: "/graph", key: "navGraph" as const, match: (p: string) => p === "/graph" },
  { href: "/notes", key: "navNotes" as const, match: (p: string) => p.startsWith("/notes") },
];

export function Shell({ children, study = false }: { children: ReactNode; study?: boolean }) {
  const path = usePath();
  const { theme, locale, toggleTheme, toggleLocale } = usePrefs();
  const copy = messages(locale);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === "/" && !paletteOpen) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl?.tagName === "INPUT" ||
          activeEl?.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement)?.isContentEditable;
        if (!isInput) {
          e.preventDefault();
          setPaletteOpen(true);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteOpen]);

  return (
    <div className="lab-shell flex min-h-dvh flex-col overflow-x-clip text-fg">
      <a
        href="#lab-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-surface"
      >
        {copy.skipToContent}
      </a>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/80 backdrop-blur-md">
        <div className="page-width flex h-12 items-center justify-between gap-4 sm:h-14">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <Link href="/" className="group flex items-center gap-2.5 no-underline">
              <span
                className="grid size-7 place-items-center rounded-md bg-fg text-surface shadow-xs transition-transform duration-200 group-hover:scale-[1.04]"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                  <path
                    d="M5 19 19 5v14Z"
                    fill="currentColor"
                    fillOpacity="0.35"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight">LightUI</span>
            </Link>
            <nav className="hidden items-center gap-0.5 sm:flex" aria-label="site">
              {NAV.map((item) => {
                const active = item.match(path);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ariaCurrent={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-md bg-surface-2 px-2.5 py-1 text-[13px] font-medium text-fg no-underline"
                        : "rounded-md px-2.5 py-1 text-[13px] text-fg-muted no-underline transition-colors duration-150 hover:bg-surface-2/80 hover:text-fg"
                    }
                  >
                    {copy[item.key]}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-left text-[12px] text-fg-muted shadow-xs transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 hover:text-fg"
              aria-label={copy.searchShortcut}
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">{copy.searchShortcut}</span>
              <kbd className="hidden rounded bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-fg-subtle sm:inline">
                ⌘K
              </kbd>
            </button>

            <IconButton
              label={locale === "zh" ? copy.langToEn : copy.langToZh}
              onClick={toggleLocale}
            >
              <span className="text-[12px] font-semibold tracking-wide">
                {locale === "zh" ? "EN" : "中"}
              </span>
            </IconButton>

            <IconButton
              label={theme === "dark" ? copy.themeToLight : copy.themeToDark}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="size-4" strokeWidth={1.8} /> : <Moon className="size-4" strokeWidth={1.8} />}
            </IconButton>

            <a
              href={GITHUB_URL}
              className="inline-flex size-9 items-center justify-center rounded-lg text-fg-muted no-underline transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
              rel="noreferrer"
              target="_blank"
              aria-label={copy.github}
            >
              <GitHubMark />
            </a>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {study ? null : (
        <div className="page-width border-b border-border/80 py-2 sm:hidden">
          <nav className="flex items-center rounded-xl border border-border bg-surface-2/80 p-1" aria-label="mobile site">
            {NAV.map((item) => {
              const active = item.match(path);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ariaCurrent={active ? "page" : undefined}
                  className={
                    active
                      ? "flex-1 rounded-lg bg-surface py-2 text-center text-[12px] font-semibold text-fg shadow-xs no-underline"
                      : "flex-1 rounded-lg py-2 text-center text-[12px] font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-fg"
                  }
                >
                  {copy[item.key]}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
      <div className="min-w-0 flex-1">{children}</div>
      {study ? null : (
        <footer className="mt-auto border-t border-border/80">
          <div className="page-width flex flex-wrap items-center justify-between gap-3 py-6">
            <p className="text-[12px] text-fg-subtle">{copy.footer}</p>
            <p className="text-[12px] text-fg-subtle">
              {copy.searchShortcut}
              <kbd className="ml-1.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </button>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}
