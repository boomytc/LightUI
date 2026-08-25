import { useState } from "react";
import { ChevronRight, File, Folder } from "lucide-react";
import { treeSelect, treeToggleExpand } from "../lib/machines";
import { loc, pick, useLocale, type Locale, type Localized } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { DemoShell, HeightSlot, RestOfPage } from "./Frame";

type Node = {
  id: string;
  label: Localized;
  children?: Node[];
};

const TREE: Node[] = [
  {
    id: "product",
    label: loc("产品", "Product"),
    children: [
      {
        id: "hardware",
        label: loc("硬件", "Hardware"),
        children: [
          { id: "keyboard", label: loc("键盘", "Keyboard") },
          { id: "mouse", label: loc("鼠标", "Mouse") },
        ],
      },
      {
        id: "software",
        label: loc("软件", "Software"),
        children: [
          { id: "apps", label: loc("应用", "Apps") },
          { id: "drivers", label: loc("驱动", "Drivers") },
        ],
      },
    ],
  },
  {
    id: "docs",
    label: loc("文档", "Docs"),
    children: [
      { id: "guides", label: loc("指南", "Guides") },
      { id: "api", label: loc("接口", "API") },
    ],
  },
];

function pathTo(nodes: Node[], id: string, trail: Node[] = []): Node[] | null {
  for (const node of nodes) {
    const next = [...trail, node];
    if (node.id === id) return next;
    if (node.children) {
      const hit = pathTo(node.children, id, next);
      if (hit) return hit;
    }
  }
  return null;
}

function initialExpanded(state?: string): Set<string> {
  if (state === "collapsed") return new Set();
  return new Set(["product", "hardware"]);
}

function initialSelected(state?: string): string | null {
  if (state === "collapsed") return "product";
  return "keyboard";
}

function Branch({
  node,
  depth,
  expanded,
  selected,
  locked,
  onExpand,
  onSelect,
  locale,
}: {
  node: Node;
  depth: number;
  expanded: ReadonlySet<string>;
  selected: string | null;
  locked: boolean;
  onExpand: (id: string) => void;
  onSelect: (id: string) => void;
  locale: Locale;
}) {
  const kids = node.children ?? [];
  const hasKids = kids.length > 0;
  const open = expanded.has(node.id);
  const on = selected === node.id;
  const Icon = hasKids ? Folder : File;

  return (
    <div>
      <div className="flex items-center gap-0.5" style={{ paddingLeft: 8 + depth * 14 }}>
        {hasKids ? (
          <button
            type="button"
            aria-label={locale === "en" ? (open ? "Collapse" : "Expand") : open ? "收起" : "展开"}
            aria-expanded={open}
            onClick={() => {
              if (locked) return;
              onExpand(node.id);
            }}
            className="grid size-7 shrink-0 place-items-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")}
              strokeWidth={1.8}
            />
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden="true" />
        )}
        <button
          type="button"
          aria-current={on ? "true" : undefined}
          onClick={() => {
            if (locked) return;
            onSelect(node.id);
          }}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px]",
            on ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
          )}
        >
          <Icon className="size-3.5 shrink-0" strokeWidth={1.8} />
          <span className="min-w-0 truncate">{pick(node.label, locale)}</span>
        </button>
      </div>
      {hasKids ? (
        <HeightSlot open={open}>
          <div className="mt-0.5">
            {kids.map((child) => (
              <Branch
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                selected={selected}
                locked={locked}
                onExpand={onExpand}
                onSelect={onSelect}
                locale={locale}
              />
            ))}
          </div>
        </HeightSlot>
      ) : null}
    </div>
  );
}

export function TreeDemo({
  state,
  compact = false,
}: {
  state?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale();
  const locked = state === "expanded" || state === "collapsed";
  const [expanded, setExpanded] = useState<Set<string>>(() => initialExpanded(state));
  const [selected, setSelected] = useState<string | null>(() => initialSelected(state));
  const currentExpanded = locked ? initialExpanded(state) : expanded;
  const currentSelected = locked ? initialSelected(state) : selected;
  const crumb = currentSelected ? pathTo(TREE, currentSelected) : null;

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · catalog" : "Orbit · 目录"}
      brand={locale === "en" ? "Catalog" : "目录"}
    >
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
          {locale === "en" ? "Selected path" : "选中路径"}
        </p>
        <p className="mt-1 truncate text-[13px] font-medium">
          {crumb
            ? crumb.map((n) => pick(n.label, locale)).join(" / ")
            : locale === "en"
              ? "Nothing selected"
              : "未选中"}
        </p>
      </div>
      <div className="px-2 py-2 sm:px-3">
        {TREE.map((node) => (
          <Branch
            key={node.id}
            node={node}
            depth={0}
            expanded={currentExpanded}
            selected={currentSelected}
            locked={locked}
            onExpand={(id) => setExpanded(treeToggleExpand(expanded, id))}
            onSelect={(id) => setSelected(treeSelect(selected, id))}
            locale={locale}
          />
        ))}
      </div>
      <RestOfPage locale={locale} />
    </DemoShell>
  );
}
