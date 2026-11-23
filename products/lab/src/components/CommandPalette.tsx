import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Command,
  FileText,
  Globe,
  Home,
  Layers,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { categoryLabel, filterStudies, getStudyCategory } from "../lib/categories";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import { filterNotes, loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";

type PaletteItem = {
  id: string;
  group: "action" | "study" | "page" | "note";
  title: string;
  subtitle?: string;
  badge?: string;
  icon: typeof Search;
  onSelect: () => void;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return <CommandPaletteDialog onClose={onClose} />;
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const { theme, locale, toggleTheme, toggleLocale } = usePrefs();
  const copy = messages(locale);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const allStudies = useMemo(
    () => loadStudies().filter((s) => s.meta.status !== "retired"),
    [],
  );
  const allNotes = useMemo(() => loadNotes(locale), [locale]);

  // Lock background scroll, manage initial focus & restore focus on close
  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  // Global Escape and focus trap inside dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const current = document.activeElement;
        if (e.shiftKey) {
          if (current === first || !dialogRef.current.contains(current)) {
            e.preventDefault();
            last.focus();
          }
        } else if (current === last || !dialogRef.current.contains(current)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  const actions: PaletteItem[] = [
    {
      id: "action-theme",
      group: "action",
      title: theme === "dark" ? copy.themeToLight : copy.themeToDark,
      subtitle: locale === "en" ? "Toggle color mode" : "切换浅色 / 深色界面",
      badge: locale === "en" ? "Theme" : "主题",
      icon: theme === "dark" ? Sun : Moon,
      onSelect: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: "action-locale",
      group: "action",
      title: locale === "zh" ? copy.langToEn : copy.langToZh,
      subtitle: locale === "en" ? "Switch language to Chinese" : "切换界面语言为 English",
      badge: locale === "en" ? "Language" : "语言",
      icon: Globe,
      onSelect: () => {
        toggleLocale();
        onClose();
      },
    },
    {
      id: "action-home",
      group: "page",
      title: copy.commandActionHome,
      subtitle: "/",
      badge: locale === "en" ? "Page" : "页面",
      icon: Home,
      onSelect: () => {
        navigate("/");
        onClose();
      },
    },
    {
      id: "action-graph",
      group: "page",
      title: copy.commandActionGraph,
      subtitle: "/graph",
      badge: locale === "en" ? "Graph" : "图谱",
      icon: Layers,
      onSelect: () => {
        navigate("/graph");
        onClose();
      },
    },
    {
      id: "action-studies",
      group: "page",
      title: copy.navWorks,
      subtitle: "/studies",
      badge: locale === "en" ? "Catalog" : "作品",
      icon: Sparkles,
      onSelect: () => {
        navigate("/studies");
        onClose();
      },
    },
    {
      id: "action-notes",
      group: "page",
      title: copy.navNotes,
      subtitle: "/notes",
      badge: locale === "en" ? "Essays" : "笔记",
      icon: BookOpen,
      onSelect: () => {
        navigate("/notes");
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((a) => {
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
      (a.badge && a.badge.toLowerCase().includes(q))
    );
  });

  const filteredStudies: PaletteItem[] = filterStudies(allStudies, query, "all").map(({ meta }) => {
    const category = getStudyCategory(meta);
    return {
      id: `study-${meta.slug}`,
      group: "study" as const,
      title: studyTitle(meta, locale),
      subtitle: studyAsks(meta, locale) || `/s/${meta.slug}`,
      badge: categoryLabel(category, locale),
      icon: Sparkles,
      onSelect: () => {
        navigate(`/s/${meta.slug}`);
        onClose();
      },
    };
  });

  const filteredNotes: PaletteItem[] = filterNotes(allNotes, query, "all").map((note) => ({
    id: `note-${note.slug}`,
    group: "note" as const,
    title: note.title,
    subtitle: note.summary || `/notes/${note.slug}`,
    badge: locale === "en" ? "Note" : "笔记",
    icon: FileText,
    onSelect: () => {
      navigate(`/notes/${note.slug}`);
      onClose();
    },
  }));

  const actionItems = filteredActions.filter((a) => a.group === "action");
  const pageItems = filteredActions.filter((a) => a.group === "page");
  const allFilteredItems = [
    ...actionItems,
    ...pageItems,
    ...filteredStudies,
    ...filteredNotes,
  ];
  const grouped = [
    { id: "action", label: copy.commandGroupActions, items: actionItems },
    { id: "page", label: copy.commandGroupPages, items: pageItems },
    { id: "study", label: copy.commandGroupStudies, items: filteredStudies },
    { id: "note", label: copy.commandGroupNotes, items: filteredNotes },
  ].filter((g) => g.items.length > 0);

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(
      `[data-palette-index="${activeIndex}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  function handleDialogKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (allFilteredItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % allFilteredItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (allFilteredItems.length > 0) {
        setActiveIndex((prev) => (prev - 1 + allFilteredItems.length) % allFilteredItems.length);
      }
    } else if (e.key === "Enter" && document.activeElement === inputRef.current) {
      e.preventDefault();
      const selected = allFilteredItems[activeIndex];
      if (selected) {
        selected.onSelect();
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.searchShortcut}
      onKeyDown={handleDialogKeyDown}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-6 sm:pt-24"
    >
      <div
        className="lab-overlay fixed inset-0 bg-black/45 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className="lab-pop relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-menu"
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={copy.commandPlaceholder}
            aria-label={copy.commandPlaceholder}
            className="flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-subtle"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              aria-label={copy.clearFilters}
              className="rounded-md p-1 text-fg-subtle transition-colors hover:text-fg"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle shadow-xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Results scroll list */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2">
          {allFilteredItems.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-fg-muted">
              <Command className="mx-auto mb-2 size-6 text-fg-subtle opacity-40" />
              <p>{copy.commandNoResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grouped.map((group) => {
                const start = allFilteredItems.findIndex((item) => item.id === group.items[0]?.id);
                return (
                  <div key={group.id}>
                    <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item, j) => {
                        const index = start + j;
                        const Icon = item.icon;
                        const isSelected = index === activeIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-palette-index={index}
                            onClick={item.onSelect}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={
                              isSelected
                                ? "group flex w-full items-center justify-between rounded-xl bg-accent px-3 py-2.5 text-left text-accent-fg shadow-xs transition-colors duration-150"
                                : "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-fg transition-colors duration-150 hover:bg-surface-2"
                            }
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={
                                  isSelected
                                    ? "grid size-7 shrink-0 place-items-center rounded-lg bg-accent-fg/15 text-accent-fg"
                                    : "grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-muted"
                                }
                              >
                                <Icon className="size-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium leading-tight">
                                  {item.title}
                                </p>
                                {item.subtitle ? (
                                  <p
                                    className={
                                      isSelected
                                        ? "mt-0.5 truncate text-[11px] text-accent-fg/80"
                                        : "mt-0.5 truncate text-[11px] text-fg-muted"
                                    }
                                  >
                                    {item.subtitle}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 pl-2">
                              {item.badge ? (
                                <span
                                  className={
                                    isSelected
                                      ? "rounded-md bg-accent-fg/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-fg"
                                      : "rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle"
                                  }
                                >
                                  {item.badge}
                                </span>
                              ) : null}
                              <ArrowRight
                                className={
                                  isSelected
                                    ? "size-3.5 text-accent-fg"
                                    : "size-3.5 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                                }
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-border bg-surface-2/60 px-4 py-2 text-[11px] text-fg-subtle">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>
              <span>{copy.commandHintNavigate}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
              <span>{copy.commandHintSelect}</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px]">
              ESC
            </kbd>
            <span>{copy.commandHintClose}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
