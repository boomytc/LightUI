import { useEffect, useRef, useState } from "react";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "./Link";
import type { Locale } from "../lib/prefs";

type DemoKey = "triangle" | "beam" | "weights";
const DEMO_TABS: readonly DemoKey[] = ["triangle", "beam", "weights"];

export function HomeShowcase({ locale }: { locale: Locale }) {
  const [activeTab, setActiveTab] = useState<DemoKey>("triangle");
  const tabRefs = useRef<Partial<Record<DemoKey, HTMLButtonElement | null>>>({});

  function tabLabel(id: DemoKey): string {
    if (id === "triangle") return locale === "en" ? "Triangle" : "安全三角";
    if (id === "beam") return locale === "en" ? "Beam" : "边光";
    return locale === "en" ? "Weights" : "按钮重量";
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
    setActiveTab(next);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/90 p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-fg">
          <Sparkles className="size-3.5 text-accent" />
          <span>{locale === "en" ? "Interactive Lab Sampler" : "精选交互体验"}</span>
        </div>

        <div
          role="tablist"
          aria-label={locale === "en" ? "Interactive Lab Sampler" : "精选交互体验"}
          onKeyDown={onTabListKeyDown}
          className="flex rounded-lg border border-border bg-surface-2/80 p-0.5"
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
                onClick={() => setActiveTab(id)}
                className={
                  active
                    ? "rounded-md bg-surface px-2.5 py-1 text-[11px] font-semibold text-fg shadow-xs"
                    : "rounded-md px-2.5 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:text-fg"
                }
              >
                {tabLabel(id)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive stage area */}
      <div
        id={`showcase-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`showcase-tab-${activeTab}`}
        className="mt-4 flex min-h-[170px] items-center justify-center rounded-2xl border border-border/80 bg-bg p-4"
      >
        <div key={activeTab} className="lab-fade w-full">
          {activeTab === "triangle" ? <TriangleMiniDemo locale={locale} /> : null}
          {activeTab === "beam" ? <BeamMiniDemo locale={locale} /> : null}
          {activeTab === "weights" ? <WeightsMiniDemo locale={locale} /> : null}
        </div>
      </div>

      {/* Footer link to full study */}
      <div className="mt-4 flex items-center justify-between text-[12px]">
        <span className="text-fg-subtle">
          {activeTab === "triangle" && (locale === "en" ? "Slope corridor protection" : "斜向穿越走廊保护")}
          {activeTab === "beam" && (locale === "en" ? "Border perimeter ray tracer" : "沿外沿圆角光束绕行")}
          {activeTab === "weights" && (locale === "en" ? "One primary solid per region" : "一区只放一个面状主操作")}
        </span>
        <Link
          href={
            activeTab === "triangle"
              ? "/s/intent-cascade"
              : activeTab === "beam"
                ? "/s/border-beam"
                : "/s/button-taxonomy"
          }
          className="inline-flex items-center gap-1 font-medium text-accent no-underline hover:underline"
        >
          {locale === "en" ? "Full study" : "查看完整研究"}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

type Pt = { x: number; y: number };

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

function TriangleMiniDemo({ locale }: { locale: Locale }) {
  const [activeItem, setActiveItem] = useState(0);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [corridorHolding, setCorridorHolding] = useState(false);

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

  const items = [
    {
      id: 0,
      label: locale === "en" ? "Preferences" : "偏好设置",
      sub: locale === "en" ? ["General", "Appearance", "Shortcuts"] : ["常规", "外观", "快捷键"],
    },
    {
      id: 1,
      label: locale === "en" ? "Extensions" : "扩展插件",
      sub: locale === "en" ? ["Installed", "Market", "Updates"] : ["已安装", "插件市场", "更新"],
    },
    {
      id: 2,
      label: locale === "en" ? "Profiles" : "账户配置",
      sub: locale === "en" ? ["Personal", "Work"] : ["个人", "工作"],
    },
  ];

  function clearPendingSwitch() {
    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    setCorridorHolding(false);
  }

  function isMovingInsideCorridor(curr: Pt): boolean {
    const anchor = anchorPointRef.current;
    const subRect = subMenuRef.current?.getBoundingClientRect();
    if (!anchor || !subRect) return false;
    if (curr.x <= anchor.x) return false;
    const topCorner: Pt = { x: subRect.left, y: subRect.top - 12 };
    const bottomCorner: Pt = { x: subRect.left, y: subRect.bottom + 12 };
    return pointInTriangle(curr, anchor, topCorner, bottomCorner);
  }

  function handlePrimaryEnter(itemId: number, e: React.MouseEvent<HTMLButtonElement>) {
    const curr: Pt = { x: e.clientX, y: e.clientY };
    if (itemId === activeItem) {
      clearPendingSwitch();
      anchorPointRef.current = curr;
      lastPointRef.current = curr;
      return;
    }

    if (isMovingInsideCorridor(curr)) {
      clearPendingSwitch();
      setCorridorHolding(true);
      switchTimerRef.current = window.setTimeout(() => {
        setActiveItem(itemId);
        setSelectedSub(null);
        setCorridorHolding(false);
        anchorPointRef.current = lastPointRef.current;
        switchTimerRef.current = null;
      }, 240);
      return;
    }

    clearPendingSwitch();
    setActiveItem(itemId);
    setSelectedSub(null);
    anchorPointRef.current = curr;
    lastPointRef.current = curr;
  }

  function handlePrimaryMove(itemId: number, e: React.MouseEvent<HTMLButtonElement>) {
    const curr: Pt = { x: e.clientX, y: e.clientY };
    if (itemId === activeItem) {
      anchorPointRef.current = curr;
    }
    lastPointRef.current = curr;
  }

  function handlePrimarySelect(itemId: number) {
    clearPendingSwitch();
    setActiveItem(itemId);
    setSelectedSub(null);
  }

  return (
    <div
      className="mx-auto flex w-full max-w-sm select-none items-start gap-2 text-[12px]"
      onMouseLeave={clearPendingSwitch}
    >
      <div className="flex-1 space-y-0.5 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={(e) => handlePrimaryEnter(item.id, e)}
              onMouseMove={(e) => handlePrimaryMove(item.id, e)}
              onClick={() => handlePrimarySelect(item.id)}
              onFocus={() => handlePrimarySelect(item.id)}
              aria-expanded={isActive}
              className={
                isActive
                  ? "flex w-full items-center justify-between rounded-lg bg-accent px-2.5 py-1.5 text-left font-medium text-accent-fg"
                  : "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              }
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-75" aria-hidden="true">
                ›
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={subMenuRef}
        onMouseEnter={clearPendingSwitch}
        className="flex-1 space-y-0.5 rounded-xl border border-border bg-surface p-1.5 shadow-sm"
      >
        <div className="flex items-center justify-between px-2 py-1 font-mono text-[10px] text-fg-subtle">
          <span>{locale === "en" ? "Protected level 2" : "受保护二级项"}</span>
          {corridorHolding ? (
            <span className="rounded bg-accent-soft px-1 text-[9px] font-semibold text-accent">
              {locale === "en" ? "Hold" : "保护中"}
            </span>
          ) : null}
        </div>
        {items[activeItem]?.sub.map((sub) => {
          const picked = selectedSub === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSub(sub)}
              className={
                picked
                  ? "block w-full rounded-lg bg-accent-soft px-2.5 py-1.5 text-left font-medium text-accent transition-colors"
                  : "block w-full rounded-lg px-2.5 py-1.5 text-left text-fg transition-colors hover:bg-accent-soft hover:text-accent"
              }
            >
              {sub}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BeamMiniDemo({ locale }: { locale: Locale }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-5 text-center shadow-card">
        {/* Animated border glow overlay */}
        <div
          className="pointer-events-none absolute -inset-[100%] animate-[spin_4s_linear_infinite] opacity-60"
          style={{
            background: "conic-gradient(from 0deg, transparent 0 340deg, var(--color-accent) 360deg)",
          }}
        />
        <div className="absolute inset-[1px] rounded-[15px] bg-surface" />
        <div className="relative z-10">
          <div className="mx-auto grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
            <Compass className="size-4 animate-pulse" />
          </div>
          <p className="mt-2 text-[13px] font-semibold text-fg">
            {locale === "en" ? "Orbiting Beam" : "圆角高光绕行"}
          </p>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            {locale === "en" ? "Pure border traversal" : "强调色光束贴着边框走"}
          </p>
        </div>
      </div>
    </div>
  );
}

function WeightsMiniDemo({ locale }: { locale: Locale }) {
  const [clicked, setClicked] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setClicked("solid")}
          className="rounded-lg bg-fg px-3.5 py-1.5 text-[12px] font-medium text-surface shadow-sm transition-transform active:scale-95"
        >
          {locale === "en" ? "Solid (Primary)" : "面状 (主操作)"}
        </button>
        <button
          type="button"
          onClick={() => setClicked("outline")}
          className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[12px] font-medium text-fg shadow-sm transition-colors hover:bg-surface-2 active:scale-95"
        >
          {locale === "en" ? "Outline" : "线状 (次)"}
        </button>
        <button
          type="button"
          onClick={() => setClicked("text")}
          className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-fg-muted hover:text-fg active:scale-95"
        >
          {locale === "en" ? "Text" : "文字 (弱)"}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-fg-muted">
        <ShieldCheck className="size-3.5 text-intent" />
        <span>
          {clicked
            ? locale === "en"
              ? `Selected weight: ${
                  clicked === "solid"
                    ? "Solid (Primary)"
                    : clicked === "outline"
                      ? "Outline"
                      : "Text"
                }`
              : `已触发操作重量：${
                  clicked === "solid"
                    ? "面状（主操作）"
                    : clicked === "outline"
                      ? "线状（次）"
                      : "文字（弱）"
                }`
            : locale === "en"
              ? "Click buttons to feel the visual hierarchy"
              : "点击按钮体验视觉重量层级"}
        </span>
      </p>
    </div>
  );
}
