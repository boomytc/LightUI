import { useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { collectPathLabels, FILTER_TREE, findNode, type MenuNode } from "../lib/menu-data";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CascadeMenu } from "./CascadeMenu";
import { SpecCard } from "./SpecCard";
import { TriangleOverlay } from "./TriangleOverlay";
import { useIntentCascade } from "./useIntentCascade";
import "./intent.css";

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

  const decision = cascade.snapshot.decision;
  const pathLabels = collectPathLabels(FILTER_TREE, cascade.snapshot.path, locale);
  const hovered = cascade.snapshot.hoveredId
    ? findNode(FILTER_TREE, cascade.snapshot.hoveredId)
    : undefined;
  const hoveredLabel = hovered ? pick(hovered.label, locale) : null;
  const openLabel = pathLabels[0] ?? null;
  const crossing =
    decision === "protected" &&
    cascade.snapshot.hoveredId != null &&
    !cascade.snapshot.path.includes(cascade.snapshot.hoveredId);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
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
          <DecisionPill locale={locale} decision={decision} enabled={enabled} />
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
        <DecisionStrip
          locale={locale}
          enabled={enabled}
          decision={decision}
          crossing={crossing}
          hoveredLabel={hoveredLabel}
          openLabel={openLabel}
        />

        <div className="mt-4 flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between xl:gap-10">
          <div className="min-w-0 flex-1">
            {pathLabels.length > 0 ? (
              <p className="mb-4 text-[12px] text-fg-subtle">
                {locale === "en" ? "Path" : "路径"} {pathLabels.join(" → ")}
              </p>
            ) : null}

            <div ref={cascade.rootRef} className="relative w-full overflow-x-auto pb-1">
              <CascadeMenu
                levels={cascade.levels}
                open={cascade.snapshot.open}
                path={cascade.snapshot.path}
                hoveredId={cascade.snapshot.hoveredId}
                selectedId={chips.at(-1)?.id ?? null}
                locale={locale}
                decision={cascade.snapshot.decision}
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
              <div className="mt-8 flex max-w-lg items-start gap-3">
                <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path className="intent-cue-slash" d="M6 8 L30 28" strokeWidth="1.5" />
                  <circle cx="6" cy="8" r="2.5" fill="var(--color-predict)" />
                  <circle cx="30" cy="28" r="2.5" fill="var(--color-predict)" />
                </svg>
                <p className="text-[13px] leading-relaxed text-fg-muted">
                  {locale === "en"
                    ? "Rest on Status, then slide diagonally to Canceled. Blue is the predicted corridor — crossed first-level items stay labeled “pass” and do not steal the submenu. It turns green after you enter."
                    : "把指针放在「状态」上，再斜着滑向右侧「已取消」。蓝色是预测走廊——途经的一级项会标「途经」，不会抢走子菜单。进入子菜单后走廊变绿。"}
                </p>
              </div>
            )}
          </div>

          <SpecCard locale={locale} restDelay={restDelay} />
        </div>

        <TriangleOverlay
          containerRef={frameRef}
          mouse={cascade.snapshot.mouse}
          bands={cascade.snapshot.bands}
          visible={showTriangles && cascade.snapshot.open && !cascade.coarse}
          locale={locale}
        />
      </div>
    </section>
  );
}

function DecisionPill({
  locale,
  decision,
  enabled,
}: {
  locale: "zh" | "en";
  decision: ReturnType<typeof useIntentCascade>["snapshot"]["decision"];
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <span className="rounded-full bg-wrong-soft px-2.5 py-1 text-[11px] font-medium text-wrong">
        {locale === "en" ? "Naive hover · crossing steals" : "经典 hover · 途经即切换"}
      </span>
    );
  }

  const tone = {
    idle: "text-fg-muted bg-surface-2",
    protected: "text-predict bg-predict-soft",
    switched: "text-fg bg-surface-2",
    confirmed: "text-intent bg-intent-soft",
    closed: "text-fg-muted bg-surface-2",
  }[decision];

  const label = {
    idle: locale === "en" ? "Idle" : "待命",
    protected: locale === "en" ? "Protected · heading in" : "保护中 · 朝向子菜单",
    switched: locale === "en" ? "Switched" : "已切换",
    confirmed: locale === "en" ? "Inside submenu" : "已进入子菜单",
    closed: locale === "en" ? "Closed" : "已收起",
  }[decision];

  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", tone)}>{label}</span>;
}

function DecisionStrip({
  locale,
  enabled,
  decision,
  crossing,
  hoveredLabel,
  openLabel,
}: {
  locale: "zh" | "en";
  enabled: boolean;
  decision: ReturnType<typeof useIntentCascade>["snapshot"]["decision"];
  crossing: boolean;
  hoveredLabel: string | null;
  openLabel: string | null;
}) {
  if (!enabled) {
    return (
      <p className="rounded-xl border border-wrong/25 bg-wrong-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-wrong">
        {locale === "en"
          ? "Intent is off. A diagonal will let the crossed item steal the submenu."
          : "意图预测已关。斜向穿越时，途经的项会立刻抢走子菜单。"}
      </p>
    );
  }

  if (crossing && hoveredLabel && openLabel) {
    return (
      <p className="rounded-xl border border-predict/25 bg-predict-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-predict">
        {locale === "en"
          ? `Crossing “${hoveredLabel}”. The open submenu is still “${openLabel}”.`
          : `途经「${hoveredLabel}」· 展开仍停在「${openLabel}」`}
      </p>
    );
  }

  if (decision === "confirmed") {
    return (
      <p className="rounded-xl border border-intent/25 bg-intent-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-intent">
        {locale === "en"
          ? "Pointer is inside the submenu. The corridor is locked."
          : "指针已在子菜单里。走廊锁定，不再把途经项当成新的展开。"}
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-border bg-surface-2/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-fg-muted">
      {locale === "en"
        ? "Vertical scan switches immediately. A diagonal into the submenu stays protected."
        : "沿一级纵向扫会立刻换项。斜着进子菜单时，走廊会挡住途经项。"}
    </p>
  );
}
