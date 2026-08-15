import { useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import { collectPathLabels, FILTER_TREE, type MenuNode } from "../lib/menu-data";
import { cn } from "../lib/utils";
import { CascadeMenu } from "./CascadeMenu";
import { TriangleOverlay } from "./TriangleOverlay";
import { useIntentCascade } from "./useIntentCascade";

type Props = {
  enabled: boolean;
  showTriangles: boolean;
  restDelay: number;
};

type Chip = { id: string; path: string[]; label: string };

const DECISION_COPY: Record<string, { label: string; tone: string }> = {
  idle: { label: "待命", tone: "text-fg-muted bg-surface-2" },
  protected: { label: "保护中 · 判定为朝向子菜单", tone: "text-predict bg-predict-soft" },
  switched: { label: "已切换", tone: "text-fg bg-surface-2" },
  confirmed: { label: "已进入子菜单", tone: "text-intent bg-intent-soft" },
  closed: { label: "已收起", tone: "text-fg-muted bg-surface-2" },
};

export function Playground({ enabled, showTriangles, restDelay }: Props) {
  const cascade = useIntentCascade({
    enabled,
    restDelay,
    tree: FILTER_TREE,
    initialPath: ["status"],
  });
  const [chips, setChips] = useState<Chip[]>([]);

  const onSelectLeaf = (node: MenuNode, path: string[]) => {
    const labels = collectPathLabels(FILTER_TREE, path);
    setChips((prev) => {
      const next = prev.filter((c) => c.id !== node.id);
      return [...next, { id: node.id, path, label: labels.join(" / ") }];
    });
  };

  const decision = DECISION_COPY[cascade.snapshot.decision] ?? DECISION_COPY.idle;
  const pathLabels = collectPathLabels(FILTER_TREE, cascade.snapshot.path);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-fg-muted">当前筛选</span>
          {chips.length === 0 ? (
            <span className="text-[13px] text-fg-subtle">尚未选择 · 在菜单里点选叶子项</span>
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
                  aria-label={`移除 ${c.label}`}
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
            重置
          </button>
        </div>
      </header>

      <div className="relative min-h-[460px] bg-[radial-gradient(circle_at_50%_0%,#eef2ff_0%,transparent_42%)] px-5 py-8 sm:min-h-[520px] sm:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => (cascade.snapshot.open ? cascade.closeMenu() : cascade.openMenu())}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-fg shadow-card hover:bg-surface-2"
          >
            <Plus className="size-3.5" />
            添加筛选
          </button>
          {pathLabels.length > 0 && cascade.snapshot.open ? (
            <span className="text-[12px] text-fg-subtle">路径 {pathLabels.join(" → ")}</span>
          ) : null}
        </div>

        <div ref={cascade.rootRef} className="relative inline-flex max-w-full overflow-x-auto pb-1">
          <CascadeMenu
            levels={cascade.levels}
            open={cascade.snapshot.open}
            path={cascade.snapshot.path}
            hoveredId={cascade.snapshot.hoveredId}
            selectedId={chips.at(-1)?.id ?? null}
            onSelectLeaf={onSelectLeaf}
            onItemClick={cascade.onItemClick}
            registerPanel={cascade.registerPanel}
            registerItem={cascade.registerItem}
          />
        </div>

        {cascade.coarse ? (
          <p className="mt-8 max-w-md text-[13px] leading-relaxed text-fg-muted">
            此交互依赖鼠标轨迹。当前是触控设备，菜单按点选展开。请在电脑上斜向划过一级菜单，观察安全三角。
          </p>
        ) : (
          <p className="mt-8 max-w-lg text-[13px] leading-relaxed text-fg-muted">
            把指针放在「状态」上，再斜着滑向右侧「已取消」。蓝色三角是预测走廊——只要还在里面，途经的其它一级项不会抢走子菜单。进入子菜单后三角变绿。
          </p>
        )}
      </div>

      <TriangleOverlay
        mouse={cascade.snapshot.mouse}
        bands={cascade.snapshot.bands}
        visible={showTriangles && cascade.snapshot.open && !cascade.coarse}
      />
    </section>
  );
}
