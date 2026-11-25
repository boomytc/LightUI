import { useEffect, useRef, useState, type ReactNode } from "react";
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

function getShortcutLabel(): string {
  if (typeof navigator === "undefined") return "⌘K";
  const platform = navigator.platform || navigator.userAgent || "";
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? "⌘K" : "Ctrl K";
}

export function Shell({ children, study = false }: { children: ReactNode; study?: boolean }) {
  const path = usePath();
  const { theme, locale, toggleTheme, toggleLocale } = usePrefs();
  const copy = messages(locale);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shortcutLabel = getShortcutLabel();

  useEffect(() => {
    if (study) {
      setScrolled(false);
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      const onScroll = () => setScrolled(window.scrollY > 4);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) {
          setScrolled(!entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [study, path]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !paletteOpen) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl?.tagName === "INPUT" ||
          activeEl?.tagName === "TEXTAREA" ||
          activeEl?.tagName === "SELECT" ||
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-3 focus:py-2 focus:text-[0.8125rem] focus:font-medium focus:text-surface"
      >
        {copy.skipToContent}
      </a>

      {/* 顶部滚动哨兵：兼容不支持 scroll-state 容器查询的浏览器 */}
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none h-px w-full -mb-px" />

      <header
        className={
          study
            ? "relative z-30 border-b border-border bg-surface/80"
            : scrolled
              ? "lab-header-sticky is-stuck"
              : "lab-header-sticky"
        }
      >
        <div className={study ? "" : "lab-header-bar"}>
          <div className="page-width flex min-h-14 items-center justify-between gap-4 py-2">
            <div className="flex min-w-0 items-center gap-6">
              <Link href="/" className="group flex items-center gap-2.5 no-underline">
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md bg-fg text-surface transition-transform duration-200 ease-[var(--lab-ease)] group-hover:scale-[1.04]"
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
                <span className="text-[1.1875rem] font-semibold leading-none tracking-[-0.03em] text-fg">
                  LightUI
                </span>
              </Link>

              <nav
                className="hidden items-center gap-1 sm:flex"
                aria-label={locale === "en" ? "Primary" : "主站点"}
              >
                {NAV.map((item) => {
                  const active = item.match(path);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      ariaCurrent={active ? "page" : undefined}
                      className={
                        active
                          ? "rounded-md px-2.5 py-1.5 text-[0.8125rem] font-semibold text-fg no-underline"
                          : "rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-fg"
                      }
                    >
                      {copy[item.key]}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-surface/90 px-3 py-1.5 text-left text-[0.8125rem] text-fg-muted transition-[border-color,background-color,color] duration-150 hover:border-border-strong hover:bg-surface hover:text-fg"
                aria-label={copy.searchShortcut}
              >
                <Search className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">{copy.searchShortcut}</span>
                <kbd className="hidden font-mono text-[0.8125rem] text-fg-subtle sm:inline">
                  {shortcutLabel}
                </kbd>
              </button>

              <IconButton
                label={locale === "zh" ? copy.langToEn : copy.langToZh}
                onClick={toggleLocale}
              >
                <span className="text-[0.8125rem] font-semibold">
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
                className="inline-flex size-9 items-center justify-center rounded-lg text-fg-muted no-underline transition-[background-color,color] duration-150 hover:bg-surface-2 hover:text-fg"
                rel="noreferrer"
                target="_blank"
                aria-label={copy.github}
              >
                <GitHubMark />
              </a>
            </div>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {study ? null : (
        <div className="page-width border-b border-border py-2 sm:hidden">
          <nav
            className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5"
            aria-label={locale === "en" ? "Mobile" : "移动端"}
          >
            {NAV.map((item) => {
              const active = item.match(path);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ariaCurrent={active ? "page" : undefined}
                  className={
                    active
                      ? "flex-1 rounded-md bg-surface py-1.5 text-center text-[0.8125rem] font-semibold text-fg no-underline"
                      : "flex-1 rounded-md py-1.5 text-center text-[0.8125rem] font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-fg"
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
        <footer className="mt-auto border-t border-border">
          <div className="page-width flex flex-wrap items-center justify-between gap-3 py-6">
            <p className="text-[0.8125rem] text-fg-subtle">{copy.footer}</p>
            <p className="hidden items-center gap-2 text-[0.8125rem] text-fg-subtle sm:flex">
              <span>{copy.searchShortcut}</span>
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.8125rem] text-fg-muted">
                {shortcutLabel}
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
      className="inline-flex size-9 items-center justify-center rounded-lg text-fg-muted transition-[background-color,color] duration-150 hover:bg-surface-2 hover:text-fg"
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
