import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "./Link";
import type { Locale } from "../lib/prefs";

type DemoKey = "triangle" | "beam" | "weights";
type BeamPace = "slow" | "normal" | "paused";
type WeightKind = "solid" | "outline" | "text";

const DEMO_TABS: readonly DemoKey[] = ["triangle", "beam", "weights"];

const TRIANGLE_ITEMS = [
  {
    id: 0,
    labelZh: "偏好设置",
    labelEn: "Preferences",
    subZh: ["常规", "外观", "快捷键"],
    subEn: ["General", "Appearance", "Shortcuts"],
  },
  {
    id: 1,
    labelZh: "扩展插件",
    labelEn: "Extensions",
    subZh: ["已安装", "插件市场", "更新"],
    subEn: ["Installed", "Marketplace", "Updates"],
  },
  {
    id: 2,
    labelZh: "账户配置",
    labelEn: "Profiles",
    subZh: ["个人", "工作区", "同步"],
    subEn: ["Personal", "Workspace", "Sync"],
  },
] as const;

export function HomeShowcase({ locale }: { locale: Locale }) {
  const [activeTab, setActiveTab] = useState<DemoKey>("triangle");
  const [triangleItem, setTriangleItem] = useState(0);
  const [triangleSubIdx, setTriangleSubIdx] = useState<number | null>(null);
  const [corridorHolding, setCorridorHolding] = useState(false);
  const [beamPace, setBeamPace] = useState<BeamPace>("normal");
  const [weightKind, setWeightKind] = useState<WeightKind>("solid");
  const tabRefs = useRef<Partial<Record<DemoKey, HTMLButtonElement | null>>>({});

  function tabLabel(id: DemoKey): string {
    if (id === "triangle") return locale === "en" ? "Safe triangle" : "安全三角";
    if (id === "beam") return locale === "en" ? "Border beam" : "边光绕行";
    return locale === "en" ? "Button weights" : "按钮重量";
  }

  function specimenHref(id: DemoKey): string {
    if (id === "triangle") return "/s/intent-cascade";
    if (id === "beam") return "/s/border-beam";
    return "/s/button-taxonomy";
  }

  function switchTab(next: DemoKey) {
    setCorridorHolding(false);
    setActiveTab(next);
  }

  function currentCaption(): string {
    if (activeTab === "triangle") {
      if (corridorHolding) {
        return locale === "en"
          ? "Diagonal corridor active: neighbor switch deferred until pointer exits the triangle."
          : "检测到斜向进入二级菜单：走廊保护生效，暂缓切换相邻主项。";
      }
      if (triangleSubIdx !== null) {
        const item = TRIANGLE_ITEMS[triangleItem];
        if (item) {
          const parent = locale === "en" ? item.labelEn : item.labelZh;
          const child = (locale === "en" ? item.subEn : item.subZh)[triangleSubIdx] ?? "";
          return locale === "en" ? `Selected: ${parent} / ${child}` : `已选中：${parent} / ${child}`;
        }
      }
      return locale === "en"
        ? "Hover a left item and sweep diagonally toward the submenu to see the corridor protect your path."
        : "悬停左侧主项后斜向滑入右侧二级菜单，观察几何走廊如何保护斜向穿越。";
    }

    if (activeTab === "beam") {
      if (beamPace === "paused") {
        return locale === "en"
          ? "Paused: perimeter arc stops cleanly without hiding the surface border."
          : "已暂停：外沿光束停驻，卡片边框与正文对比度不受影响。";
      }
      if (beamPace === "slow") {
        return locale === "en"
          ? "Slow orbit (7s): gentle ambient presence for low-priority focus frames."
          : "慢速绕行（7s）：适合低干扰的聚焦提示外框。";
      }
      return locale === "en"
        ? "Accent light travels strictly along the perimeter radius without washing out inner content."
        : "强调色光束严格贴合外沿圆角绕行，不侵占内部内容对比度。";
    }

    if (weightKind === "outline") {
      return locale === "en"
        ? "Outline secondary: valid alternative that does not compete with the primary fill."
        : "线状次操作：明确可执行，但不与面状主操作争夺第一落眼点。";
    }
    if (weightKind === "text") {
      return locale === "en"
        ? "Text weak action: quiet escape hatch such as cancel or skip."
        : "文字弱操作：最低视觉重量，适合取消或跳过等退让动作。";
    }
    return locale === "en"
      ? "Solid primary: one per region. Carries the single committed forward action."
      : "面状主操作：一区仅放一个，承载当前最明确的提交动作。";
  }

  function onTabListKeyDown(e: React.KeyboardEvent) {
    const idx = DEMO_TABS.indexOf(activeTab);
    let next: DemoKey | undefined;
    if (e.key === "ArrowRight") next = DEMO_TABS[(idx + 1) % DEMO_TABS.length];
    else if (e.key === "ArrowLeft") next = DEMO_TABS[(idx - 1 + DEMO_TABS.length) % DEMO_TABS.length];
    else if (e.key === "Home") next = DEMO_TABS[0];
    else if (e.key === "End") next = DEMO_TABS[DEMO_TABS.length - 1];
    if (!next) return;
    e.preventDefault();
    switchTab(next);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  }

  return (
    <section
      aria-label={locale === "en" ? "Interactive specimen workbench" : "交互标本实验台"}
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div
          role="tablist"
          aria-label={locale === "en" ? "Interactive specimens" : "交互标本切换"}
          onKeyDown={onTabListKeyDown}
          className="inline-flex flex-wrap items-center rounded-lg border border-border bg-surface-2 p-0.5"
        >
          {DEMO_TABS.map((id) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                id={`showcase-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`showcase-panel-${id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => switchTab(id)}
                className={
                  active
                    ? "rounded-md bg-surface px-3 py-1.5 text-[0.8125rem] font-semibold text-fg transition-colors duration-150"
                    : "rounded-md px-3 py-1.5 text-[0.8125rem] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
                }
              >
                {tabLabel(id)}
              </button>
            );
          })}
        </div>

        <Link
          href={specimenHref(activeTab)}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-accent no-underline transition-colors duration-150 hover:underline"
        >
          <span>{locale === "en" ? "Open full study" : "查看完整研究"}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div
        id={`showcase-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`showcase-tab-${activeTab}`}
        className="lab-stage-grid relative flex min-h-[250px] flex-col items-center justify-center px-4 py-7 sm:min-h-[285px] sm:px-8 sm:py-9"
      >
        <div key={activeTab} className="lab-fade w-full">
          {activeTab === "triangle" ? (
            <TriangleMiniDemo
              locale={locale}
              activeItem={triangleItem}
              selectedSubIdx={triangleSubIdx}
              corridorHolding={corridorHolding}
              onActiveItemChange={(next) => {
                setTriangleItem(next);
                setTriangleSubIdx(null);
              }}
              onSelectSub={setTriangleSubIdx}
              onHoldingChange={setCorridorHolding}
            />
          ) : null}
          {activeTab === "beam" ? (
            <BeamMiniDemo locale={locale} pace={beamPace} onPaceChange={setBeamPace} />
          ) : null}
          {activeTab === "weights" ? (
            <WeightsMiniDemo locale={locale} selected={weightKind} onSelect={setWeightKind} />
          ) : null}
        </div>
      </div>

      <div
        aria-live="polite"
        className="border-t border-border bg-surface-2/40 px-4 py-3 text-[0.8125rem] leading-relaxed text-fg-muted sm:px-6"
      >
        {currentCaption()}
      </div>
    </section>
  );
}

type Pt = { x: number; y: number };
type CorridorGeometry = {
  anchor: Pt;
  top: Pt;
  bottom: Pt;
};

function cross(a: Pt, b: Pt, c: Pt): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointInTriangle(p: Pt, a: Pt, b: Pt, c: Pt): boolean {
  const c1 = cross(a, b, p);
  const c2 = cross(b, c, p);
  const c3 = cross(c, a, p);
  const hasNeg = c1 < 0 || c2 < 0 || c3 < 0;
  const hasPos = c1 > 0 || c2 > 0 || c3 > 0;
  return !(hasNeg && hasPos);
}

function TriangleMiniDemo({
  locale,
  activeItem,
  selectedSubIdx,
  corridorHolding,
  onActiveItemChange,
  onSelectSub,
  onHoldingChange,
}: {
  locale: Locale;
  activeItem: number;
  selectedSubIdx: number | null;
  corridorHolding: boolean;
  onActiveItemChange: (itemId: number) => void;
  onSelectSub: (subIndex: number) => void;
  onHoldingChange: (holding: boolean) => void;
}) {
  const [geometry, setGeometry] = useState<CorridorGeometry | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);
  const anchorPointRef = useRef<Pt | null>(null);
  const lastPointRef = useRef<Pt | null>(null);
  const switchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current !== null) {
        window.clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  function clearPendingSwitch() {
    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    onHoldingChange(false);
  }

  function updateGeometry(anchor: Pt | null) {
    const stageRect = stageRef.current?.getBoundingClientRect();
    const subRect = subMenuRef.current?.getBoundingClientRect();
    if (!anchor || !stageRect || !subRect) {
      setGeometry(null);
      return;
    }
    setGeometry({
      anchor: { x: anchor.x - stageRect.left, y: anchor.y - stageRect.top },
      top: { x: subRect.left - stageRect.left, y: subRect.top - stageRect.top },
      bottom: { x: subRect.left - stageRect.left, y: subRect.bottom - stageRect.top },
    });
  }

  function isMovingInsideCorridor(curr: Pt): boolean {
    const anchor = anchorPointRef.current;
    const subRect = subMenuRef.current?.getBoundingClientRect();
    if (!anchor || !subRect) return false;
    if (curr.x <= anchor.x) return false;
    const topCorner: Pt = { x: subRect.left, y: subRect.top - 14 };
    const bottomCorner: Pt = { x: subRect.left, y: subRect.bottom + 14 };
    return pointInTriangle(curr, anchor, topCorner, bottomCorner);
  }

  function handlePrimaryEnter(itemId: number, e: React.MouseEvent<HTMLButtonElement>) {
    const curr: Pt = { x: e.clientX, y: e.clientY };
    if (itemId === activeItem) {
      clearPendingSwitch();
      anchorPointRef.current = curr;
      lastPointRef.current = curr;
      updateGeometry(curr);
      return;
    }

    if (isMovingInsideCorridor(curr)) {
      clearPendingSwitch();
      onHoldingChange(true);
      updateGeometry(anchorPointRef.current);
      switchTimerRef.current = window.setTimeout(() => {
        onActiveItemChange(itemId);
        onHoldingChange(false);
        anchorPointRef.current = lastPointRef.current;
        updateGeometry(lastPointRef.current);
        switchTimerRef.current = null;
      }, 240);
      return;
    }

    clearPendingSwitch();
    onActiveItemChange(itemId);
    anchorPointRef.current = curr;
    lastPointRef.current = curr;
    updateGeometry(curr);
  }

  function handlePrimaryMove(itemId: number, e: React.MouseEvent<HTMLButtonElement>) {
    const curr: Pt = { x: e.clientX, y: e.clientY };
    if (itemId === activeItem) {
      anchorPointRef.current = curr;
    }
    lastPointRef.current = curr;
    updateGeometry(anchorPointRef.current);
  }

  function handlePrimarySelect(itemId: number) {
    clearPendingSwitch();
    onActiveItemChange(itemId);
  }

  function handleStageLeave() {
    clearPendingSwitch();
    setGeometry(null);
  }

  const primaryRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handlePrimaryKeyDown(index: number, e: React.KeyboardEvent<HTMLButtonElement>) {
    let nextIdx: number | undefined;
    if (e.key === "ArrowDown") nextIdx = (index + 1) % TRIANGLE_ITEMS.length;
    else if (e.key === "ArrowUp") nextIdx = (index - 1 + TRIANGLE_ITEMS.length) % TRIANGLE_ITEMS.length;
    if (nextIdx === undefined) return;
    e.preventDefault();
    const nextItem = TRIANGLE_ITEMS[nextIdx];
    if (nextItem) {
      handlePrimarySelect(nextItem.id);
      primaryRefs.current[nextIdx]?.focus();
    }
  }

  const activeEntry = TRIANGLE_ITEMS[activeItem] ?? TRIANGLE_ITEMS[0];
  const subLabels = locale === "en" ? activeEntry.subEn : activeEntry.subZh;

  return (
    <div
      ref={stageRef}
      onMouseLeave={handleStageLeave}
      className="relative mx-auto w-full max-w-[34rem] select-none"
    >
      {geometry ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 size-full overflow-visible"
        >
          <polygon
            points={`${geometry.anchor.x},${geometry.anchor.y} ${geometry.top.x},${geometry.top.y} ${geometry.bottom.x},${geometry.bottom.y}`}
            className={
              corridorHolding
                ? "fill-accent/18 stroke-accent transition-[fill,stroke] duration-150"
                : "fill-accent/8 stroke-accent/55 transition-[fill,stroke] duration-150"
            }
            strokeWidth={corridorHolding ? 1.5 : 1}
            strokeDasharray={corridorHolding ? undefined : "4 3"}
          />
          <circle cx={geometry.anchor.x} cy={geometry.anchor.y} r={3.5} className="fill-accent" />
          <circle cx={geometry.top.x} cy={geometry.top.y} r={2.5} className="fill-accent/80" />
          <circle cx={geometry.bottom.x} cy={geometry.bottom.y} r={2.5} className="fill-accent/80" />
        </svg>
      ) : null}

      <div className="relative z-0 grid grid-cols-2 gap-4 sm:gap-10">
        <div className="space-y-1 rounded-xl border border-border-strong bg-surface p-2 shadow-card">
          {TRIANGLE_ITEMS.map((item, idx) => {
            const isActive = activeItem === item.id;
            const label = locale === "en" ? item.labelEn : item.labelZh;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  primaryRefs.current[idx] = el;
                }}
                type="button"
                onMouseEnter={(e) => handlePrimaryEnter(item.id, e)}
                onMouseMove={(e) => handlePrimaryMove(item.id, e)}
                onClick={() => handlePrimarySelect(item.id)}
                onKeyDown={(e) => handlePrimaryKeyDown(idx, e)}
                aria-expanded={isActive}
                className={
                  isActive
                    ? "flex w-full items-center justify-between rounded-lg bg-accent px-3 py-2 text-left text-[0.8125rem] font-semibold text-accent-fg"
                    : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.8125rem] font-medium text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
                }
              >
                <span className="truncate">{label}</span>
                <span className="opacity-75" aria-hidden="true">
                  ›
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={subMenuRef}
          onMouseEnter={() => {
            clearPendingSwitch();
            setGeometry(null);
          }}
          className="space-y-1 rounded-xl border border-border-strong bg-surface p-2 shadow-card"
        >
          <div className="flex items-center justify-between px-3 py-1.5 text-[0.8125rem] text-fg-subtle">
            <span>{locale === "en" ? activeEntry.labelEn : activeEntry.labelZh}</span>
            {corridorHolding ? (
              <span className="font-medium text-accent">
                {locale === "en" ? "Holding" : "走廊保护中"}
              </span>
            ) : null}
          </div>
          {subLabels.map((sub, subIndex) => {
            const picked = selectedSubIdx === subIndex;
            return (
              <button
                key={subIndex}
                type="button"
                aria-pressed={picked}
                onClick={() => onSelectSub(subIndex)}
                className={
                  picked
                    ? "block w-full rounded-lg bg-accent-soft px-3 py-2 text-left text-[0.8125rem] font-semibold text-accent transition-colors duration-150"
                    : "block w-full rounded-lg px-3 py-2 text-left text-[0.8125rem] text-fg transition-colors duration-150 hover:bg-surface-2"
                }
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BeamMiniDemo({
  locale,
  pace,
  onPaceChange,
}: {
  locale: Locale;
  pace: BeamPace;
  onPaceChange: (pace: BeamPace) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      <div
        data-beam-card=""
        data-pace={pace}
        className="lab-beam-card w-full max-w-[20rem] rounded-2xl px-7 py-6 text-center shadow-card"
      >
        <p className="text-[0.9375rem] font-semibold tracking-tight text-fg">
          {locale === "en" ? "Perimeter ray" : "外沿圆角光束"}
        </p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Inner surface stays completely neutral and legible."
            : "内层卡片保持纯平面与完整文字对比度。"}
        </p>
      </div>

      <div
        role="group"
        aria-label={locale === "en" ? "Beam pace" : "光束节奏"}
        className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5"
      >
        {(
          [
            { id: "slow", zh: "慢速", en: "Slow" },
            { id: "normal", zh: "标准", en: "Standard" },
            { id: "paused", zh: "暂停", en: "Paused" },
          ] as const
        ).map((item) => {
          const active = pace === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onPaceChange(item.id)}
              className={
                active
                  ? "rounded-md bg-surface-2 px-3 py-1 text-[0.8125rem] font-semibold text-fg"
                  : "rounded-md px-3 py-1 text-[0.8125rem] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
              }
            >
              {locale === "en" ? item.en : item.zh}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeightsMiniDemo({
  locale,
  selected,
  onSelect,
}: {
  locale: Locale;
  selected: WeightKind;
  onSelect: (kind: WeightKind) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center">
      <div
        role="group"
        aria-label={locale === "en" ? "Button weight hierarchy" : "按钮重量层级"}
        className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border-strong bg-surface px-5 py-4 shadow-card"
      >
        <button
          type="button"
          aria-pressed={selected === "text"}
          onClick={() => onSelect("text")}
          className={
            selected === "text"
              ? "min-h-9 rounded-lg px-3 py-1.5 text-[0.8125rem] font-semibold text-accent underline underline-offset-4"
              : "min-h-9 rounded-lg px-3 py-1.5 text-[0.8125rem] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
          }
        >
          {locale === "en" ? "Cancel" : "暂不保存"}
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-pressed={selected === "outline"}
            onClick={() => onSelect("outline")}
            className={
              selected === "outline"
                ? "min-h-9 rounded-lg border border-accent bg-accent-soft px-4 py-1.5 text-[0.8125rem] font-semibold text-accent transition-colors duration-150"
                : "min-h-9 rounded-lg border border-border-strong bg-surface px-4 py-1.5 text-[0.8125rem] font-medium text-fg transition-[border-color,background-color] duration-150 hover:bg-surface-2"
            }
          >
            {locale === "en" ? "Save draft" : "存为草稿"}
          </button>

          <button
            type="button"
            aria-pressed={selected === "solid"}
            onClick={() => onSelect("solid")}
            className={
              selected === "solid"
                ? "min-h-9 rounded-lg bg-fg px-4 py-1.5 text-[0.8125rem] font-semibold text-surface ring-2 ring-accent/40 ring-offset-2 ring-offset-surface transition-opacity duration-150"
                : "min-h-9 rounded-lg bg-fg px-4 py-1.5 text-[0.8125rem] font-semibold text-surface transition-opacity duration-150 hover:opacity-90"
            }
          >
            {locale === "en" ? "Publish change" : "发布变更"}
          </button>
        </div>
      </div>
    </div>
  );
}
