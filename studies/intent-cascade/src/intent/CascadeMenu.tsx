import { useMemo, useState } from "react";
import { Check, ChevronRight, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { TONE_CLASS, type MenuNode } from "../lib/menu-data";
import { pick, type Locale } from "../lib/site-locale";
import type { LevelSlice } from "./types";

type Props = {
  levels: LevelSlice[];
  open: boolean;
  path: string[];
  hoveredId: string | null;
  selectedId: string | null;
  locale: Locale;
  onSelectLeaf: (node: MenuNode, path: string[]) => void;
  onItemClick: (level: number, node: MenuNode) => void;
  registerPanel: (level: number, el: HTMLElement | null) => void;
  registerItem: (id: string, el: HTMLElement | null) => void;
};

function filterNodes(nodes: MenuNode[], q: string): MenuNode[] {
  const s = q.trim().toLowerCase();
  if (!s) return nodes;
  return nodes.filter((n) => n.label.zh.toLowerCase().includes(s) || n.label.en.toLowerCase().includes(s));
}

export function CascadeMenu({
  levels,
  open,
  path,
  hoveredId,
  selectedId,
  onSelectLeaf,
  onItemClick,
  registerPanel,
  registerItem,
  locale,
}: Props) {
  const [queries, setQueries] = useState<Record<number, string>>({});

  if (!open) return null;

  return (
    <div className="flex items-start gap-2">
      {levels.map((slice) => (
        <Panel
          key={slice.level}
          slice={slice}
          query={queries[slice.level] ?? ""}
          onQuery={(v) => setQueries((prev) => ({ ...prev, [slice.level]: v }))}
          path={path}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onSelectLeaf={onSelectLeaf}
          onItemClick={onItemClick}
          registerPanel={registerPanel}
          registerItem={registerItem}
          locale={locale}
        />
      ))}
    </div>
  );
}

function Panel({
  slice,
  query,
  onQuery,
  path,
  hoveredId,
  selectedId,
  onSelectLeaf,
  onItemClick,
  registerPanel,
  registerItem,
  locale,
}: {
  slice: LevelSlice;
  query: string;
  onQuery: (v: string) => void;
  path: string[];
  hoveredId: string | null;
  selectedId: string | null;
  onSelectLeaf: (node: MenuNode, path: string[]) => void;
  onItemClick: (level: number, node: MenuNode) => void;
  registerPanel: (level: number, el: HTMLElement | null) => void;
  registerItem: (id: string, el: HTMLElement | null) => void;
  locale: Locale;
}) {
  const shown = useMemo(() => filterNodes(slice.nodes, query), [slice.nodes, query]);

  return (
    <div
      ref={(el) => registerPanel(slice.level, el)}
      className="w-[232px] shrink-0 overflow-hidden rounded-xl border border-border bg-surface shadow-menu"
    >
      <div className="border-b border-border px-3 py-2">
        <label className="flex items-center gap-2 text-fg-subtle">
          <Search className="size-3.5 shrink-0" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={slice.placeholder}
            className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
          />
        </label>
      </div>
      <ul className="flex flex-col p-1.5" role="menu">
        {shown.length === 0 ? (
          <li className="px-2.5 py-3 text-center text-[12px] text-fg-subtle">
            {locale === "en" ? "No matches" : "无匹配项"}
          </li>
        ) : (
          shown.map((node) => {
            const active = slice.activeId === node.id;
            const hovered = hoveredId === node.id;
            const picked = selectedId === node.id;
            const hasKids = !!node.children?.length;
            const Icon = node.icon;
            return (
              <li key={node.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  data-node={node.id}
                  ref={(el) => registerItem(node.id, el)}
                  onClick={() => {
                    onItemClick(slice.level, node);
                    if (!hasKids) onSelectLeaf(node, [...path.slice(0, slice.level), node.id]);
                  }}
                  className={cn(
                    "flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] transition-colors duration-150",
                    active || hovered || picked
                      ? "bg-accent-soft text-fg"
                      : "text-fg hover:bg-surface-2",
                  )}
                >
                  <Icon
                    className={cn("size-3.5 shrink-0", node.tone ? TONE_CLASS[node.tone] : "text-fg-muted")}
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{pick(node.label, locale)}</span>
                  {picked ? <Check className="size-3.5 text-accent" strokeWidth={2.4} /> : null}
                  {hasKids ? <ChevronRight className="size-3.5 text-fg-subtle" strokeWidth={2} /> : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
