import { useEffect, useRef, useState } from "react";
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
import { getStudyCategory } from "../lib/categories";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import { loadNotes } from "../lib/notes";
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

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { theme, locale, toggleTheme, toggleLocale } = usePrefs();
  const copy = messages(locale);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const allStudies = loadStudies().filter((s) => s.meta.status !== "retired");
  const allNotes = loadNotes(locale);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  // Compile item list
  const actions: PaletteItem[] = [
    {
      id: "action-theme",
      group: "action",
      title: theme === "dark" ? copy.themeToLight : copy.themeToDark,
      subtitle: locale === "en" ? "Toggle color mode" : "切换浅色 / 深色界面",
      badge: "Theme",
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
      badge: "Language",
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
      badge: "Page",
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
      badge: "Graph",
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
      badge: "Catalog",
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
      badge: "Essays",
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
      (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );
  });

  const filteredStudies: PaletteItem[] = allStudies
    .filter(({ meta }) => {
      if (!q) return true;
      const title = (meta.title ?? "").toLowerCase();
      const asks = (meta.asks ?? "").toLowerCase();
      const asksEn = (meta.asksEn ?? "").toLowerCase();
      const summary = (meta.summary ?? "").toLowerCase();
      const slug = meta.slug.toLowerCase();
      const tags = (meta.tags ?? []).join(" ").toLowerCase();
      return (
        title.includes(q) ||
        asks.includes(q) ||
        asksEn.includes(q) ||
        summary.includes(q) ||
        slug.includes(q) ||
        tags.includes(q)
      );
    })
    .map(({ meta }) => {
      const category = getStudyCategory(meta.slug);
      return {
        id: `study-${meta.slug}`,
        group: "study" as const,
        title: studyTitle(meta, locale),
        subtitle: studyAsks(meta, locale) || `/s/${meta.slug}`,
        badge: category,
        icon: Sparkles,
        onSelect: () => {
          navigate(`/s/${meta.slug}`);
          onClose();
        },
      };
    });

  const filteredNotes: PaletteItem[] = allNotes
    .filter((note) => {
      if (!q) return true;
      return (
        note.title.toLowerCase().includes(q) ||
        note.slug.toLowerCase().includes(q) ||
        note.summary.toLowerCase().includes(q)
      );
    })
    .map((note) => ({
      id: `note-${note.slug}`,
      group: "note" as const,
      title: note.title,
      subtitle: note.summary || `/notes/${note.slug}`,
      badge: "Note",
      icon: FileText,
      onSelect: () => {
        navigate(`/notes/${note.slug}`);
        onClose();
      },
    }));

  const allFilteredItems = [
    ...filteredActions,
    ...filteredStudies,
    ...filteredNotes,
  ];

  // Scroll active item into view when activeIndex changes
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-palette-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (allFilteredItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % allFilteredItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (allFilteredItems.length > 0) {
        setActiveIndex((prev) => (prev - 1 + allFilteredItems.length) % allFilteredItems.length);
      }
    } else if (e.key === "Enter") {
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
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-6 sm:pt-24"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Floating Modal Panel */}
      <div className="relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-200">
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <Search className="size-4 shrink-0 text-fg-subtle" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={copy.commandPlaceholder}
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
              className="text-fg-subtle hover:text-fg"
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
            <div className="space-y-1">
              {allFilteredItems.map((item, index) => {
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
                        ? "flex w-full items-center justify-between rounded-xl bg-accent px-3 py-2.5 text-left text-white shadow-xs transition-colors"
                        : "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-fg hover:bg-surface-2 transition-colors"
                    }
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={
                          isSelected
                            ? "grid size-7 shrink-0 place-items-center rounded-lg bg-white/20 text-white"
                            : "grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-muted"
                        }
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium leading-tight">{item.title}</p>
                        {item.subtitle ? (
                          <p
                            className={
                              isSelected
                                ? "mt-0.5 truncate text-[11px] text-white/80"
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
                              ? "rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white"
                              : "rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase text-fg-subtle"
                          }
                        >
                          {item.badge}
                        </span>
                      ) : null}
                      <ArrowRight
                        className={
                          isSelected
                            ? "size-3.5 text-white"
                            : "size-3.5 text-fg-subtle opacity-0 group-hover:opacity-100"
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-border bg-surface-2/60 px-4 py-2 text-[11px] text-fg-subtle">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface px-1 py-0.2 font-mono text-[10px]">↑↓</kbd>
              <span>{copy.commandHintNavigate}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface px-1 py-0.2 font-mono text-[10px]">↵</kbd>
              <span>{copy.commandHintSelect}</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-border bg-surface px-1 py-0.2 font-mono text-[10px]">ESC</kbd>
            <span>{copy.commandHintClose}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
