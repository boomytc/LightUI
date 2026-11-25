import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Command,
  Compass,
  FileText,
  Globe,
  Home,
  Layers,
  Moon,
  Search,
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
  metaLabel?: string;
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
  if (!isOpen) return null;
  return <CommandPaletteDialog onClose={onClose} />;
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const { theme, locale, toggleTheme, toggleLocale } = usePrefs();
  const copy = messages(locale);
  const listboxId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const composingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  onCloseRef.current = onClose;

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const allStudies = useMemo(
    () => loadStudies().filter((s) => s.meta.status !== "retired"),
    [],
  );
  const allNotes = useMemo(() => loadNotes(locale), [locale]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      // HTML 规范中 dialog.close() 异步派发 close 事件；StrictMode 清理后立即重开时 dialog.open 已恢复为 true，须忽略陈旧事件
      if (!dialog.open) {
        onCloseRef.current();
      }
    };

    const handleNativeCancel = (e: Event) => {
      if (composingRef.current) {
        e.preventDefault();
      }
    };

    dialog.addEventListener("close", handleNativeClose);
    dialog.addEventListener("cancel", handleNativeCancel);

    // 针对尚未支持 dialog[closedby="any"] 的浏览器（如 Safari）补充按压+抬起均在面板外才关闭的轻触收起
    let removeOutsideFallback: (() => void) | undefined;
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e) && dialog.open) {
          dialog.close();
        }
        pressedOutside = false;
      };
      dialog.addEventListener("pointerdown", onPointerDown);
      dialog.addEventListener("pointerup", onPointerUp);
      removeOutsideFallback = () => {
        dialog.removeEventListener("pointerdown", onPointerDown);
        dialog.removeEventListener("pointerup", onPointerUp);
      };
    }

    if (!dialog.open) {
      dialog.showModal();
    }
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      removeOutsideFallback?.();
      dialog.removeEventListener("close", handleNativeClose);
      dialog.removeEventListener("cancel", handleNativeCancel);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const q = query.trim().toLowerCase();

  const actions: PaletteItem[] = [
    {
      id: "action-theme",
      group: "action",
      title: theme === "dark" ? copy.themeToLight : copy.themeToDark,
      subtitle: locale === "en" ? "Toggle color mode" : "切换浅色 / 深色界面",
      metaLabel: locale === "en" ? "Theme" : "主题",
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
      metaLabel: locale === "en" ? "Language" : "语言",
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
      metaLabel: locale === "en" ? "Page" : "页面",
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
      metaLabel: locale === "en" ? "Map" : "图谱",
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
      metaLabel: locale === "en" ? "Catalog" : "作品",
      icon: Compass,
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
      metaLabel: locale === "en" ? "Essays" : "笔记",
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
      (a.metaLabel && a.metaLabel.toLowerCase().includes(q))
    );
  });

  const filteredStudies: PaletteItem[] = filterStudies(allStudies, query, "all").map(({ meta }) => {
    const category = getStudyCategory(meta);
    return {
      id: `study-${meta.slug}`,
      group: "study" as const,
      title: studyTitle(meta, locale),
      subtitle: studyAsks(meta, locale) || `/s/${meta.slug}`,
      metaLabel: categoryLabel(category, locale),
      icon: Compass,
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
    metaLabel: locale === "en" ? "Note" : "笔记",
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

  const safeActiveIndex =
    allFilteredItems.length > 0 ? Math.min(activeIndex, allFilteredItems.length - 1) : -1;
  const activeOptionId =
    safeActiveIndex >= 0 ? `${listboxId}-opt-${safeActiveIndex}` : undefined;

  useEffect(() => {
    if (!listRef.current || safeActiveIndex < 0) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(
      `[data-palette-index="${safeActiveIndex}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [safeActiveIndex]);

  function handleDialogKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229 || composingRef.current) {
      if (e.key === "Escape") {
        e.preventDefault();
      }
      return;
    }
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
      const selected = safeActiveIndex >= 0 ? allFilteredItems[safeActiveIndex] : undefined;
      if (selected) {
        selected.onSelect();
      }
    }
  }

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as Record<string, string>)}
      aria-label={copy.searchShortcut}
      onKeyDown={handleDialogKeyDown}
      className="lab-palette-dialog"
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
        <input
          ref={inputRef}
          autoFocus
          type="text"
          role="combobox"
          aria-expanded={true}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          value={query}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          placeholder={copy.commandPlaceholder}
          aria-label={copy.commandPlaceholder}
          className="flex-1 bg-transparent text-[0.9375rem] text-fg outline-none placeholder:text-fg-subtle"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(0);
              inputRef.current?.focus();
            }}
            aria-label={copy.clearSearch}
            className="rounded-md p-1 text-fg-subtle transition-colors duration-150 hover:text-fg"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.commandHintClose}
            className="rounded-md p-1 text-fg-subtle transition-colors duration-150 hover:text-fg sm:px-1.5 sm:py-0.5"
          >
            <X className="size-4 sm:hidden" />
            <kbd className="hidden font-mono text-[0.8125rem] sm:inline">Esc</kbd>
          </button>
        )}
      </div>

      <div
        id={listboxId}
        ref={listRef}
        role="listbox"
        aria-label={copy.searchShortcut}
        className="flex-1 overflow-y-auto overscroll-contain p-2"
      >
        {allFilteredItems.length === 0 ? (
          <div className="py-12 text-center text-[0.8125rem] text-fg-muted">
            <Command className="mx-auto mb-2 size-5 text-fg-subtle opacity-50" />
            <p>{copy.commandNoResults}</p>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            {grouped.map((group) => {
              const start = allFilteredItems.findIndex((item) => item.id === group.items[0]?.id);
              const groupHeadingId = `${listboxId}-group-${group.id}`;
              return (
                <div key={group.id} role="group" aria-labelledby={groupHeadingId}>
                  <p
                    id={groupHeadingId}
                    className="px-3 pb-1.5 text-[0.8125rem] font-medium text-fg-subtle"
                  >
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item, j) => {
                      const index = start + j;
                      const Icon = item.icon;
                      const isSelected = index === safeActiveIndex;
                      return (
                        <button
                          key={item.id}
                          id={`${listboxId}-opt-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={-1}
                          data-palette-index={index}
                          onClick={item.onSelect}
                          onPointerMove={(e) => {
                            if (e.pointerType !== "mouse") return;
                            const prev = lastPointerRef.current;
                            if (prev && prev.x === e.clientX && prev.y === e.clientY) return;
                            lastPointerRef.current = { x: e.clientX, y: e.clientY };
                            setActiveIndex(index);
                          }}
                          className={
                            isSelected
                              ? "group flex w-full items-center justify-between rounded-lg bg-accent px-3 py-2.5 text-left text-accent-fg transition-colors duration-150"
                              : "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-fg transition-colors duration-150 hover:bg-surface-2"
                          }
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <Icon
                              className={
                                isSelected
                                  ? "size-4 shrink-0 text-accent-fg"
                                  : "size-4 shrink-0 text-fg-subtle"
                              }
                            />
                            <span className="block min-w-0">
                              <span className="block truncate text-[0.9375rem] font-medium leading-snug">
                                {item.title}
                              </span>
                              {item.subtitle ? (
                                <span
                                  className={
                                    isSelected
                                      ? "mt-0.5 block truncate text-[0.8125rem] text-accent-fg/85"
                                      : "mt-0.5 block truncate text-[0.8125rem] text-fg-muted"
                                  }
                                >
                                  {item.subtitle}
                                </span>
                              ) : null}
                            </span>
                          </span>

                          <span className="flex shrink-0 items-center gap-2 pl-3">
                            {item.metaLabel ? (
                              <span
                                className={
                                  isSelected
                                    ? "text-[0.8125rem] text-accent-fg/85"
                                    : "text-[0.8125rem] text-fg-subtle"
                                }
                              >
                                {item.metaLabel}
                              </span>
                            ) : null}
                            <ArrowRight
                              className={
                                isSelected
                                  ? "size-3.5 text-accent-fg"
                                  : "size-3.5 text-fg-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                              }
                            />
                          </span>
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

      <div className="flex items-center justify-between border-t border-border bg-surface-2/60 px-4 py-2.5 text-[0.8125rem] text-fg-subtle">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="font-mono text-fg-muted">↑↓</kbd>
            <span>{copy.commandHintNavigate}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="font-mono text-fg-muted">↵</kbd>
            <span>{copy.commandHintSelect}</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="font-mono text-fg-muted">Esc</kbd>
          <span>{copy.commandHintClose}</span>
        </span>
      </div>
    </dialog>
  );
}
