import { useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { collectPathLabels, FILTER_TREE, type MenuNode } from "../lib/menu-data";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CascadeMenu } from "./CascadeMenu";
import { SpecCard } from "./SpecCard";
import { TriangleOverlay } from "./TriangleOverlay";
import { useIntentCascade } from "./useIntentCascade";

type Props = {
  enabled: boolean;
  showTriangles: boolean;
  restDelay: number;
};

type Chip = { id: string; path: string[]; label: string };

export function Playground({ enabled, showTriangles, restDelay }: Props) {
  const locale = useLocale();
  const cascade = useIntentCascade({
    enabled,
    restDelay,
    tree: FILTER_TREE,
    initialPath: ["status"],
    locale,
    persistent: true,
  });
  const [chips, setChips] = useState<Chip[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);

  const onSelectLeaf = (node: MenuNode, path: string[]) => {
    const labels = collectPathLabels(FILTER_TREE, path, locale);
    setChips((prev) => {
      const next = prev.filter((c) => c.id !== node.id);
      return [...next, { id: node.id, path, label: labels.join(" / ") }];
    });
  };

  const decisions = {
    idle: { label: locale === "en" ? "Idle" : "待命", tone: "text-fg-muted bg-surface-2" },
    protected: {
      label: locale === "en" ? "Protected · heading into submenu" : "保护中 · 判定为朝向子菜单",
      tone: "text-predict bg-predict-soft",
    },
    switched: { label: locale === "en" ? "Switched" : "已切换", tone: "text-fg bg-surface-2" },
    confirmed: {
      label: locale === "en" ? "Inside submenu" : "已进入子菜单",
      tone: "text-intent bg-intent-soft",
    },
    closed: { label: locale === "en" ? "Closed" : "已收起", tone: "text-fg-muted bg-surface-2" },
  };
  const decision = decisions[cascade.snapshot.decision] ?? decisions.idle;
  const pathLabels = collectPathLabels(FILTER_TREE, cascade.snapshot.path, locale);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-fg-muted">
            {locale === "en" ? "Filters" : "当前筛选"}
          </span>
          {chips.length === 0 ? (
            <span className="text-[13px] text-fg-subtle">
              {locale === "en" ? "None yet · pick a leaf in the menu" : "尚未选择 · 在菜单里点选叶子项"}
            </span>
          ) : (
            chips.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-medium text-accent"
              >
                {c.label}
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-surface"
                  onClick={() => setChips((prev) => prev.filter((x) => x.id !== c.id))}
                  aria-label={locale === "en" ? `Remove ${c.label}` : `移除 ${c.label}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", decision.tone)}>
            {decision.label}
          </span>
          <button
            type="button"
            onClick={() => {
              cascade.resetDemo();
              setChips([]);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] font-medium text-fg-muted hover:bg-surface-2"
          >
            <RotateCcw className="size-3.5" />
            {locale === "en" ? "Reset" : "重置"}
          </button>
        </div>
      </header>

      <div
        ref={frameRef}
        className="relative min-h-[460px] overflow-hidden bg-[radial-gradient(circle_at_50%_0%,var(--color-play-glow)_0%,transparent_42%)] px-5 py-8 sm:min-h-[520px] sm:px-10"
      >
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between xl:gap-10">
          <div className="min-w-0 flex-1">
            {pathLabels.length > 0 ? (
              <p className="mb-4 text-[12px] text-fg-subtle">
                {locale === "en" ? "Path" : "路径"} {pathLabels.join(" → ")}
              </p>
            ) : null}

            <div ref={cascade.rootRef} className="relative inline-flex max-w-full overflow-x-auto pb-1">
              <CascadeMenu
                levels={cascade.levels}
                open={cascade.snapshot.open}
                path={cascade.snapshot.path}
                hoveredId={cascade.snapshot.hoveredId}
                selectedId={chips.at(-1)?.id ?? null}
                locale={locale}
                onSelectLeaf={onSelectLeaf}
                onItemClick={cascade.onItemClick}
                registerPanel={cascade.registerPanel}
                registerItem={cascade.registerItem}
              />
            </div>

            {cascade.coarse ? (
              <p className="mt-8 max-w-md text-[13px] leading-relaxed text-fg-muted">
                {locale === "en"
                  ? "This interaction needs a mouse trail. On a touch device the menu opens by tap. Try a diagonal slide on a computer to see the safe triangle."
                  : "此交互依赖鼠标轨迹。当前是触控设备，菜单按点选展开。请在电脑上斜向划过一级菜单，观察安全三角。"}
              </p>
            ) : (
              <p className="mt-8 max-w-lg text-[13px] leading-relaxed text-fg-muted">
                {locale === "en"
                  ? "Rest on Status, then slide diagonally to Canceled. The blue triangle is the predicted corridor — while you stay inside, other first-level items will not steal the submenu. It turns green after you enter the submenu."
                  : "把指针放在「状态」上，再斜着滑向右侧「已取消」。蓝色三角是预测走廊——只要还在里面，途经的其它一级项不会抢走子菜单。进入子菜单后三角变绿。"}
              </p>
            )}
          </div>

          <SpecCard locale={locale} restDelay={restDelay} />
        </div>

        <TriangleOverlay
          containerRef={frameRef}
          mouse={cascade.snapshot.mouse}
          bands={cascade.snapshot.bands}
          visible={showTriangles && cascade.snapshot.open && !cascade.coarse}
        />
      </div>
    </section>
  );
}
